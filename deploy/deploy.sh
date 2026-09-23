#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  lscblack.tech portfolio — one-shot production deploy (Ubuntu/Debian, systemd)
#
#  • Web   : https://lscblack.tech (+ www → apex)  → nginx serving Clients/dist, proxying /api and /uploads
#  • API   : https://api.lscblack.tech               → gunicorn/uvicorn on a free local port (systemd: lscblack-api)
#  • Code  : /var/www/lscblack-portfolio  • Python: conda env "fastapi_setup" • DB: PostgreSQL
#
#  Usage (on the server, as a sudoer):
#     sudo bash deploy/deploy.sh                 # full install / update (idempotent)
#     sudo bash deploy/deploy.sh --backend-only  # skip the frontend build
#     sudo bash deploy/deploy.sh --frontend-only # rebuild + publish the SPA only
#     sudo bash deploy/deploy.sh --no-certbot    # don't touch TLS certificates
#     sudo bash deploy/deploy.sh --install-packages  # allow apt-get for missing tools (off by default: this
#                                                # server hosts other apps and apt triggers needrestart)
#
#  Scope: only lscblack-api.service, the nginx site files for our domains (nginx is *reloaded*, never
#  restarted) and the PostgreSQL role password from .env are touched. No other service is restarted.
#  Afterwards manage it with:  lsc status|start|stop|restart|logs|update …
# ─────────────────────────────────────────────────────────────────────────────
set -Eeuo pipefail
trap 'printf "\e[1;31m✖ deploy failed at line %s: %s\e[0m\n" "$LINENO" "$BASH_COMMAND" >&2; echo "   (run again with --verbose for a full trace; lsc logs shows the API journal)"' ERR

APP_DIR="${APP_DIR:-/var/www/lscblack-portfolio}"
CONDA_ENV="${CONDA_ENV:-fastapi_setup}"
API_DOMAIN="${API_DOMAIN:-api.lscblack.tech}"
WEB_DOMAIN="${WEB_DOMAIN:-lscblack.tech}"
WWW_DOMAIN="${WWW_DOMAIN:-www.lscblack.tech}"
SERVICE="lscblack-api"
RUN_USER="${RUN_USER:-www-data}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-tech@nexventures.net}"
BACKEND_DIR="Server"
FRONTEND_DIR="Clients"
STATE_DIR="$APP_DIR/.deploy"
DO_BACKEND=1; DO_FRONTEND=1; DO_CERTBOT=1; INSTALL_PKGS=0
for a in "$@"; do case "$a" in
  --backend-only) DO_FRONTEND=0;; --frontend-only) DO_BACKEND=0;; --no-certbot) DO_CERTBOT=0;; --install-packages) INSTALL_PKGS=1;; --verbose|-v) set -x;;
  -h|--help) sed -n 2,18p "$0"; exit 0;; *) echo "unknown option $a"; exit 1;; esac; done

apt_install() {
  ((INSTALL_PKGS)) || die "missing: $* — install them yourself (apt-get install $*) or rerun with --install-packages"
  NEEDRESTART_SUSPEND=1 NEEDRESTART_MODE=l DEBIAN_FRONTEND=noninteractive apt-get install -y -qq -o Dpkg::Options::=--force-confold "$@"
}
log()  { printf '\e[1;34m▶ %s\e[0m\n' "$*"; }
ok()   { printf '\e[1;32m✔ %s\e[0m\n' "$*"; }
die()  { printf '\e[1;31m✖ %s\e[0m\n' "$*" >&2; exit 1; }
[[ $EUID -eq 0 ]] || die "run with sudo"
printf '\e[1m\n═══ lscblack.tech portfolio — deploy ═══\e[0m\n'
echo "   app dir : $APP_DIR      conda env: $CONDA_ENV"
echo "   web     : https://$WEB_DOMAIN  (https://$WWW_DOMAIN → apex)"
echo "   api     : https://$API_DOMAIN"
echo
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── 0. code in place ────────────────────────────────────────────────────────
mkdir -p "$APP_DIR" "$STATE_DIR"
if [[ "$SRC_DIR" != "$APP_DIR" ]]; then
  log "Syncing code $SRC_DIR → $APP_DIR"
  command -v rsync >/dev/null || apt_install rsync
  rsync -a --delete --exclude .git --exclude node_modules --exclude dist --exclude .venv --exclude __pycache__ \
        --exclude "$BACKEND_DIR/.env" --exclude "$BACKEND_DIR/uploads" --exclude '.deploy' "$SRC_DIR/" "$APP_DIR/"
fi
cd "$APP_DIR"

# ── 1. environment file ─────────────────────────────────────────────────────
ENV_FILE="$APP_DIR/$BACKEND_DIR/.env"
PROD_ENV=""; for f in "$SRC_DIR/$BACKEND_DIR/.env.production" "$APP_DIR/$BACKEND_DIR/.env.production"; do [[ -f "$f" ]] && { PROD_ENV="$f"; break; }; done
# a development .env copied from a laptop must not run in production: swap it for .env.production and keep a backup
if [[ -f "$ENV_FILE" && -n "$PROD_ENV" ]] && grep -qE '^APP_ENV=development' "$ENV_FILE"; then
  cp "$ENV_FILE" "$ENV_FILE.dev.bak.$(date +%s)"; cp "$PROD_ENV" "$ENV_FILE"
  ok "Replaced development .env with .env.production (backup kept next to it)"
fi
if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -n "$PROD_ENV" ]]; then cp "$PROD_ENV" "$ENV_FILE"; else cp "$APP_DIR/$BACKEND_DIR/.env.example" "$ENV_FILE"; fi
  ok "Created $ENV_FILE — review it if this is the first deploy"
fi
envget() { { grep -E "^$1=" "$ENV_FILE" || true; } | tail -1 | cut -d= -f2- | sed 's/^"//;s/"$//;s/^'"'"'//;s/'"'"'$//'; }
envset() { if grep -qE "^$1=" "$ENV_FILE"; then sed -i "s|^$1=.*|$1=$2|" "$ENV_FILE"; else printf '%s=%s\n' "$1" "$2" >> "$ENV_FILE"; fi; }
# production values for the domains (kept in sync on every deploy)
envset APP_ENV production
envset DEBUG false
envset FRONTEND_URL "https://$WEB_DOMAIN"
envset CORS_ORIGINS "https://$WEB_DOMAIN,https://$WWW_DOMAIN"
envset FORCE_HTTPS true
envset UPLOAD_DIR "$APP_DIR/$BACKEND_DIR/uploads"
envset MEDIA_BASE_URL "https://$API_DOMAIN"
envset CAPTCHA_BYPASS_CODE ""
# a real signing secret is mandatory in production — generate one once
SECRET="$(envget JWT_SECRET)"
if [[ -z "$SECRET" || "$SECRET" == "change-this-secret" ]]; then
  envset JWT_SECRET "$(openssl rand -hex 48)"; ok "Generated JWT_SECRET"
fi
[[ -n "$(envget DATA_ENCRYPTION_KEY)" ]] || { envset DATA_ENCRYPTION_KEY "$(openssl rand -hex 32)"; ok "Generated DATA_ENCRYPTION_KEY"; }
chown "$RUN_USER:$RUN_USER" "$ENV_FILE"; chmod 640 "$ENV_FILE"
DB_USER="$(envget DB_USER)"; DB_USER="${DB_USER:-postgres}"
DB_NAME="$(envget DB_NAME)"; DB_NAME="${DB_NAME:-lscblack_portfolio}"
DB_PASSWORD="$(envget DB_PASSWORD)"
DB_HOST="$(envget DB_HOST)"; DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="$(envget DB_PORT)"; DB_PORT="${DB_PORT:-5432}"
if [[ -z "$DB_PASSWORD" ]]; then
  DB_PASSWORD="$(envget DATABASE_URL | sed -nE 's#^[a-z+]+://[^:]+:([^@]+)@.*#\1#p' | "$(command -v python3)" -c 'import sys,urllib.parse;print(urllib.parse.unquote(sys.stdin.read().strip()))')"
fi
[[ -n "$DB_PASSWORD" ]] || die "DB_PASSWORD is empty in $ENV_FILE — set DB_PASSWORD=... and rerun"
# keep DATABASE_URL consistent with the DB_* parts
envset DATABASE_URL "postgresql+psycopg://$DB_USER:$("$(command -v python3)" -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1],safe=""))' "$DB_PASSWORD")@$DB_HOST:$DB_PORT/$DB_NAME"
ok "env file: $ENV_FILE (db user $DB_USER, db $DB_NAME @ $DB_HOST)"

# ── 2. system packages ──────────────────────────────────────────────────────
log "Checking required tools (nothing is installed or restarted unless --install-packages)"
need=(); command -v nginx >/dev/null || need+=(nginx)
command -v psql >/dev/null || need+=(postgresql-client); command -v curl >/dev/null || need+=(curl); command -v openssl >/dev/null || need+=(openssl)
((${#need[@]})) && apt_install "${need[@]}"
for svc in nginx postgresql; do
  systemctl is-active --quiet "$svc" && ok "$svc is running" || echo "   ! $svc is not active — start it yourself (systemctl start $svc)"
done

# ── 3. database role password (existing role only — the app creates the database) ──
pg_try() { PGPASSWORD="$1" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -w -tAc "select 1" >/dev/null 2>&1; }
log "Checking PostgreSQL access for role '$DB_USER'"
ESC_PW="${DB_PASSWORD//\'/\'\'}"
if pg_try "$DB_PASSWORD"; then
  ok "role $DB_USER accepts DB_PASSWORD"
elif sudo -u postgres psql -w -tAc "select 1" >/dev/null 2>&1; then
  sudo -u postgres psql -w -qc "ALTER ROLE \"$DB_USER\" WITH PASSWORD '$ESC_PW';"
  ok "password of role $DB_USER set from DB_PASSWORD"
else
  echo "   PostgreSQL asks for a password even for local admin access. Enter the CURRENT password of '$DB_USER' once:"
  for attempt in 1 2 3; do
    read -rs -p "   Current PostgreSQL password for $DB_USER: " CUR_PW; echo
    if pg_try "$CUR_PW"; then
      PGPASSWORD="$CUR_PW" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -w -qc "ALTER ROLE \"$DB_USER\" WITH PASSWORD '$ESC_PW';"
      ok "password of role $DB_USER changed to DB_PASSWORD"; break
    fi
    echo "   ✖ that password was rejected"
    (( attempt == 3 )) && die "could not authenticate to PostgreSQL as $DB_USER (check pg_hba.conf)"
  done
fi
pg_try "$DB_PASSWORD" || die "PostgreSQL still rejects DB_PASSWORD for $DB_USER@$DB_HOST:$DB_PORT"
ok "PostgreSQL connection OK; database '$DB_NAME' is created by the app if missing"
REDIS_URL="$(envget REDIS_URL)"
if [[ -n "$REDIS_URL" ]] && command -v redis-cli >/dev/null; then
  if [[ "$(redis-cli -u "$REDIS_URL" ping 2>/dev/null)" == "PONG" ]]; then ok "Redis reachable (shared cache + rate limits)"
  else echo "   ! Redis did not answer at $REDIS_URL — the API falls back to in-process caching (fine for one worker set)"; fi
fi

# ── 4. python env (conda) ───────────────────────────────────────────────────
PYBIN=""
if [[ "$CONDA_ENV" == /* && -x "$CONDA_ENV/bin/python" ]]; then PYBIN="$CONDA_ENV/bin"; fi
for c in "${CONDA_EXE:-}" /opt/conda/bin/conda /opt/miniconda3/bin/conda /opt/anaconda3/bin/conda "$HOME/miniconda3/bin/conda" "$HOME/anaconda3/bin/conda" /usr/local/bin/conda "$(command -v conda || true)"; do
  [[ -z "$PYBIN" && -n "$c" && -x "$c" ]] || continue
  base="$("$c" info --base 2>/dev/null || true)"; [[ -n "$base" ]] || continue
  if [[ -x "$base/envs/$CONDA_ENV/bin/python" ]]; then PYBIN="$base/envs/$CONDA_ENV/bin"; break; fi
done
if [[ -z "$PYBIN" ]]; then for d in /home/*/miniconda3 /home/*/anaconda3 /root/miniconda3 /root/anaconda3; do
  [[ -x "$d/envs/$CONDA_ENV/bin/python" ]] && { PYBIN="$d/envs/$CONDA_ENV/bin"; break; }; done; fi
[[ -n "$PYBIN" ]] || die "conda env '$CONDA_ENV' not found — create it: conda create -n $CONDA_ENV python=3.11"
echo "$PYBIN" > "$STATE_DIR/pybin"
ok "python: $PYBIN/python ($("$PYBIN/python" --version 2>&1))"
if ! sudo -u "$RUN_USER" test -x "$PYBIN/python" 2>/dev/null; then
  echo "   $RUN_USER cannot execute $PYBIN/python (private home directory) — the service will run as root instead."
  echo "   To keep www-data, move the env out of the home dir: conda create -p /opt/conda-envs/$CONDA_ENV --clone $CONDA_ENV"
  RUN_USER=root
fi
if ((DO_BACKEND)); then
  log "Installing Python dependencies into $PYBIN"
  "$PYBIN/python" -m pip install -q --upgrade pip
  "$PYBIN/python" -m pip install -q -r "$APP_DIR/$BACKEND_DIR/requirements.txt"
  ok "python deps installed"
fi

# ── 5. pick (and remember) a free API port ─────────────────────────────────
if [[ -f "$STATE_DIR/api_port" ]]; then API_PORT="$(cat "$STATE_DIR/api_port")"
else API_PORT="$("$PYBIN/python" - <<'PY'
import socket, random
for _ in range(50):
    p = random.randint(20000, 60000)
    s = socket.socket()
    try:
        s.bind(("127.0.0.1", p)); print(p); break
    except OSError: continue
    finally: s.close()
PY
)"; echo "$API_PORT" > "$STATE_DIR/api_port"; fi
ok "API port: $API_PORT"

# ── 6. permissions ──────────────────────────────────────────────────────────
mkdir -p "$APP_DIR/$BACKEND_DIR/uploads"
chown -R "$RUN_USER:$RUN_USER" "$APP_DIR/$BACKEND_DIR" "$STATE_DIR"
chmod -R u+rwX,go+rX,go-w "$APP_DIR/$BACKEND_DIR"; chmod 640 "$ENV_FILE"

# ── 7. systemd service ──────────────────────────────────────────────────────
if ((DO_BACKEND)); then
  log "Pre-start check: wait for DB → create DB if missing → tables → seed (full errors show here)"
  ( cd "$APP_DIR/$BACKEND_DIR" && sudo -u "$RUN_USER" env PYTHONUNBUFFERED=1 "$PYBIN/python" prestart.py ) || die "prestart.py failed — the traceback above is the reason the service cannot start"
  log "Writing /etc/systemd/system/$SERVICE.service"
  WORKERS=$(( $(nproc) * 2 + 1 )); (( WORKERS > 4 )) && WORKERS=4
  sed -e "s|@APP_DIR@|$APP_DIR|g" -e "s|@PYBIN@|$PYBIN|g" -e "s|@PORT@|$API_PORT|g" -e "s|@USER@|$RUN_USER|g" -e "s|@WORKERS@|$WORKERS|g" -e "s|@BACKEND@|$BACKEND_DIR|g" \
      "$APP_DIR/deploy/lscblack-api.service" > "/etc/systemd/system/$SERVICE.service"
  if [[ "$PYBIN" == /root/* || "$PYBIN" == /home/* ]]; then
    sed -i -e '/^ProtectHome=/d' -e '/^ProtectSystem=/d' -e '/^NoNewPrivileges=/d' "/etc/systemd/system/$SERVICE.service"
  fi
  systemctl daemon-reload
  systemctl enable "$SERVICE" >/dev/null
  log "Starting $SERVICE"
  systemctl restart "$SERVICE" || true
  for i in $(seq 1 60); do
    sleep 1; printf '.'
    curl -fs "http://127.0.0.1:$API_PORT/api/public/health" >/dev/null 2>&1 && break
    systemctl is-failed --quiet "$SERVICE" && break
  done; echo
  if curl -fs "http://127.0.0.1:$API_PORT/api/public/health" >/dev/null 2>&1; then ok "$SERVICE is running on 127.0.0.1:$API_PORT"
  else echo; echo "── last journal lines of $SERVICE ──"; journalctl -u "$SERVICE" -n 80 --no-pager -o cat | grep -v '^░░' || true; die "$SERVICE is not answering on port $API_PORT (see journal above)"; fi
fi

# ── 8. frontend build ───────────────────────────────────────────────────────
if ((DO_FRONTEND)); then
  if ! command -v node >/dev/null || [[ "$(node -v | cut -c2- | cut -d. -f1)" -lt 20 ]]; then
    ((INSTALL_PKGS)) || die "Node.js 20+ is required to build the frontend (found: $(node -v 2>/dev/null || echo none)). Install it, or rerun with --install-packages, or build locally and rsync $FRONTEND_DIR/dist"
    log "Installing Node.js 22 (NodeSource)"; curl -fsSL https://deb.nodesource.com/setup_22.x | NEEDRESTART_SUSPEND=1 bash - >/dev/null; apt_install nodejs
  fi
  log "Building frontend"
  PNPM="pnpm"; command -v pnpm >/dev/null || { command -v corepack >/dev/null && corepack enable pnpm >/dev/null 2>&1 || true; }
  command -v pnpm >/dev/null || PNPM="npx --yes pnpm@11"
  ( cd "$APP_DIR/$FRONTEND_DIR" && printf 'VITE_API_URL=\n' > .env.production && CI=true $PNPM install --frozen-lockfile --silent && $PNPM build --silent )
  chown -R "$RUN_USER:$RUN_USER" "$APP_DIR/$FRONTEND_DIR/dist"
  ok "frontend built → $APP_DIR/$FRONTEND_DIR/dist"
fi

# ── 9. nginx ────────────────────────────────────────────────────────────────
log "Writing nginx sites (our domains only)"
render() {  # $1 template, $2 cert-domain — emits the TLS listen/redirect itself when a certificate exists
  local tpl="$1" d="$2" live="/etc/letsencrypt/live/$2" listen redirect names="$3"
  if [[ -f "$live/fullchain.pem" ]]; then
    listen="    listen 443 ssl;\n    listen [::]:443 ssl;\n    http2 on;\n    ssl_certificate $live/fullchain.pem;\n    ssl_certificate_key $live/privkey.pem;"
    [[ -f /etc/letsencrypt/options-ssl-nginx.conf ]] && listen+="\n    include /etc/letsencrypt/options-ssl-nginx.conf;"
    [[ -f /etc/letsencrypt/ssl-dhparams.pem ]] && listen+="\n    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;"
    redirect="# HTTP → HTTPS (ACME challenges still answered so renewals work)\nserver {\n    listen 80;\n    listen [::]:80;\n    server_name $names;\n    location /.well-known/acme-challenge/ { root /var/www/html; }\n    location / { return 301 https://\$host\$request_uri; }\n}"
  else
    listen="    listen 80;\n    listen [::]:80;"; redirect=""
  fi
  sed -e "s|@APP_DIR@|$APP_DIR|g" -e "s|@PORT@|$API_PORT|g" -e "s|@API_DOMAIN@|$API_DOMAIN|g" -e "s|@WEB_DOMAIN@|$WEB_DOMAIN|g" -e "s|@WWW_DOMAIN@|$WWW_DOMAIN|g" -e "s|@FRONTEND@|$FRONTEND_DIR|g" "$tpl" \
    | awk -v L="$listen" -v R="$redirect" '{ if ($0=="@LISTEN@") { gsub(/\\n/,"\n",L); print L } else if ($0=="@REDIRECT@") { gsub(/\\n/,"\n",R); print R } else print }'
}
mkdir -p /var/www/html
render "$APP_DIR/deploy/nginx-api.conf" "$API_DOMAIN" "$API_DOMAIN" > "/etc/nginx/sites-available/$API_DOMAIN"
render "$APP_DIR/deploy/nginx-web.conf" "$WEB_DOMAIN" "$WEB_DOMAIN $WWW_DOMAIN" > "/etc/nginx/sites-available/$WEB_DOMAIN"
ln -sf "/etc/nginx/sites-available/$API_DOMAIN" "/etc/nginx/sites-enabled/$API_DOMAIN"
ln -sf "/etc/nginx/sites-available/$WEB_DOMAIN" "/etc/nginx/sites-enabled/$WEB_DOMAIN"
for d in "$API_DOMAIN" "$WEB_DOMAIN"; do [[ -f "/etc/letsencrypt/live/$d/fullchain.pem" ]] && ok "$d: HTTPS (443) + redirect from 80" || echo "   $d: HTTP only until a certificate exists"; done
nginx -t && systemctl reload nginx && ok "nginx reloaded (our sites only)"

# ── 10. TLS (one certificate per site; the web certificate covers apex + www) ──
TLS_MISSING=()
if ((DO_CERTBOT)) && command -v certbot >/dev/null; then
  cert_for() { # $1 primary domain, rest: extra names
    local primary="$1"; shift
    if [[ -d "/etc/letsencrypt/live/$primary" ]]; then ok "certificate present for $primary"; return; fi
    local args=(-d "$primary") d
    for d in "$@"; do getent ahosts "$d" >/dev/null 2>&1 && args+=(-d "$d") || echo "   ! $d has no A record yet — left out of the certificate"; done
    if ! getent ahosts "$primary" >/dev/null 2>&1; then echo "   ✖ $primary has no A record yet — add one pointing here, then:  lsc cert"; TLS_MISSING+=("$primary"); return; fi
    log "Requesting Let's Encrypt certificate for ${args[*]}"
    certbot --nginx "${args[@]}" --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect || { echo "   ✖ certbot failed for $primary — fix the issue above, then:  lsc cert"; TLS_MISSING+=("$primary"); }
  }
  cert_for "$API_DOMAIN"
  cert_for "$WEB_DOMAIN" "$WWW_DOMAIN"
  render "$APP_DIR/deploy/nginx-api.conf" "$API_DOMAIN" "$API_DOMAIN" > "/etc/nginx/sites-available/$API_DOMAIN"
  render "$APP_DIR/deploy/nginx-web.conf" "$WEB_DOMAIN" "$WEB_DOMAIN $WWW_DOMAIN" > "/etc/nginx/sites-available/$WEB_DOMAIN"
  nginx -t && systemctl reload nginx
  ((${#TLS_MISSING[@]})) && echo "   TLS still missing for: ${TLS_MISSING[*]}" || ok "TLS in place (auto-renew via certbot.timer)"
elif ((DO_CERTBOT)); then
  echo "   certbot not installed — skipping TLS (apt-get install certbot python3-certbot-nginx, then: lsc cert)"
fi

# ── 11. management CLI ──────────────────────────────────────────────────────
install -m 755 "$APP_DIR/deploy/lsc" /usr/local/bin/lsc
echo -e "APP_DIR=$APP_DIR\nSERVICE=$SERVICE\nAPI_PORT=$API_PORT\nPYBIN=$PYBIN\nAPI_DOMAIN=$API_DOMAIN\nWEB_DOMAIN=$WEB_DOMAIN\nWWW_DOMAIN=$WWW_DOMAIN\nRUN_USER=$RUN_USER\nBACKEND_DIR=$BACKEND_DIR\nFRONTEND_DIR=$FRONTEND_DIR\nDB_NAME=$DB_NAME" > "$STATE_DIR/config"

echo; ok "Deploy complete"
scheme() { [[ -d "/etc/letsencrypt/live/$1" ]] && echo https || echo http; }
echo "   Web : $(scheme "$WEB_DOMAIN")://$WEB_DOMAIN     dashboard: $(scheme "$WEB_DOMAIN")://$WEB_DOMAIN/admin"
echo "   API : $(scheme "$API_DOMAIN")://$API_DOMAIN/api/public/health"
echo "   Manage: lsc status | lsc logs | lsc restart | lsc update | lsc help"
