#!/usr/bin/env bash
# =========================================================================
# Coleccion de pruebas cURL - EcoHome Store API
# Demuestra el flujo: signup -> login -> usar token -> CRUD
# (incluye error esperado cuando no hay token / rol incorrecto)
#
# Uso: BASE_URL=http://localhost:3000/api/v1 bash tests/curl-collection.sh
#
# Nota: usa `node` para parsear JSON (en vez de python3), porque node ya
# es un requisito del proyecto y no todos los equipos tienen Python.
# =========================================================================
set -e
BASE_URL="${BASE_URL:-http://localhost:3000/api/v1}"

extract() {
  # Uso: extract <json_string> <ruta.separada.por.puntos>
  node -e "
    const data = JSON.parse(process.argv[1]);
    const path = process.argv[2].split('.');
    let cur = data;
    for (const key of path) { cur = cur ? cur[key] : undefined; }
    console.log(cur);
  " "$1" "$2"
}

echo "== 0. Verificando que el servidor responde en $BASE_URL =="
HEALTH=$(curl -s "$BASE_URL/health")
echo "$HEALTH"
if [[ "$HEALTH" != *"\"status\":\"up\""* ]]; then
  echo ""
  echo "ERROR: la respuesta de /health no es la esperada."
  echo "Verifica que:"
  echo "  1) El servidor de EcoHome (npm start) esta corriendo."
  echo "  2) BASE_URL apunta al puerto correcto (revisa tu .env -> PORT)."
  echo "  3) Ningun otro proceso/aplicacion esta usando ese puerto."
  exit 1
fi
echo -e "\n"

echo "== 1. Signup ADMIN =="
curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin EcoHome","email":"admin@ecohome.test","password":"Admin123!","role":"admin"}'
echo -e "\n"

echo "== 2. Signup CLIENTE =="
curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente Demo","email":"cliente@ecohome.test","password":"Cliente123!"}'
echo -e "\n"

echo "== 3. Login ADMIN (obtener token) =="
LOGIN_ADMIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecohome.test","password":"Admin123!"}')
echo "$LOGIN_ADMIN_RES"
ADMIN_TOKEN=$(extract "$LOGIN_ADMIN_RES" "data.token")
echo "ADMIN_TOKEN=$ADMIN_TOKEN"
echo -e "\n"

echo "== 4. Login CLIENTE (obtener token) =="
LOGIN_CLIENT_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@ecohome.test","password":"Cliente123!"}')
echo "$LOGIN_CLIENT_RES"
CLIENT_TOKEN=$(extract "$LOGIN_CLIENT_RES" "data.token")
echo "CLIENT_TOKEN=$CLIENT_TOKEN"
echo -e "\n"

echo "== 5. POST /products SIN token -> debe fallar 401 =="
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Vaso de vidrio reciclado","price":15.5}'

echo "== 6. POST /products con token de CLIENTE -> debe fallar 403 =="
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{"name":"Vaso de vidrio reciclado","price":15.5}'

echo "== 7. POST /products con token de ADMIN -> 201 Created =="
CREATE_RES=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Vaso de vidrio reciclado","price":15.5,"stock":40}')
echo "$CREATE_RES"
PRODUCT_ID=$(extract "$CREATE_RES" "data.id")
echo "PRODUCT_ID=$PRODUCT_ID"
echo -e "\n"

echo "== 8. POST /products con price invalido (<=0) -> 400 =="
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Producto invalido","price":0}'

echo "== 9. GET /products (publico) -> 200 =="
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE_URL/products"

echo "== 10. GET /products/:id existente -> 200 =="
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE_URL/products/$PRODUCT_ID"

echo "== 11. GET /products/:id inexistente -> 404 =="
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE_URL/products/00000000-0000-0000-0000-000000000000"

echo "== 12. PATCH /products/:id (marcar agotado) con ADMIN -> 200 =="
curl -s -X PATCH "$BASE_URL/products/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"isActive":false,"stock":0}'
echo -e "\n"

echo "== 13. DELETE /products/:id con CLIENTE -> 403 =="
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X DELETE "$BASE_URL/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $CLIENT_TOKEN"

echo "== 14. DELETE /products/:id con ADMIN -> 200 =="
curl -s -X DELETE "$BASE_URL/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n"

echo "== 15. GET /products/:id ya eliminado -> 404 =="
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE_URL/products/$PRODUCT_ID"

echo "== Fin de la coleccion =="
