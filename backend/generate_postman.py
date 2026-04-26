"""Generate Postman collection JSON for MegaMart API."""
import json, uuid

BASE = "http://localhost:8000/api"

def req(name, method, url, body=None, auth=False, tests=None, pre=None):
    r = {
        "name": name,
        "request": {
            "method": method,
            "header": [{"key":"Content-Type","value":"application/json"}],
            "url": url if '?' in url else {"raw": url, "protocol":"http","host":["localhost"],"port":"8000","path": url.replace("http://localhost:8000/","").strip("/").split("/") + [""]},
        },
        "event": []
    }
    if auth:
        r["request"]["header"].append({"key":"Authorization","value":"Bearer {{access_token}}"})
    if body:
        r["request"]["body"] = {"mode":"raw","raw": json.dumps(body, indent=2)}
    if tests:
        r["event"].append({"listen":"test","script":{"type":"text/javascript","exec": tests}})
    if pre:
        r["event"].append({"listen":"prerequest","script":{"type":"text/javascript","exec": pre}})
    return r

col = {
    "info": {
        "name": "MegaMart E-Commerce API",
        "_postman_id": str(uuid.uuid4()),
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        "description": "Complete API test collection for MegaMart Django backend"
    },
    "variable": [
        {"key":"base_url","value":"http://localhost:8000/api"},
        {"key":"access_token","value":""},
        {"key":"refresh_token","value":""},
        {"key":"user_id","value":""},
        {"key":"address_id","value":""},
        {"key":"product_id","value":""},
        {"key":"category_slug","value":""},
        {"key":"cart_item_id","value":""},
        {"key":"order_id","value":""},
    ],
    "item": []
}

# ── 1. AUTH ──
auth_folder = {"name": "1. Authentication", "item": []}

auth_folder["item"].append(req(
    "Register New User", "POST", f"{BASE}/auth/register/",
    body={"email":"newman@test.com","username":"newmanuser","first_name":"Newman","last_name":"Tester","password":"TestPass123!","password_confirm":"TestPass123!"},
    tests=[
        "pm.test('Register returns 201', function(){ pm.response.to.have.status(201); });",
        "var j = pm.response.json();",
        "pm.test('Has tokens', function(){ pm.expect(j.tokens).to.have.property('access'); });",
        "pm.collectionVariables.set('access_token', j.tokens.access);",
        "pm.collectionVariables.set('refresh_token', j.tokens.refresh);",
        "pm.collectionVariables.set('user_id', j.user.id);"
    ]
))

auth_folder["item"].append(req(
    "Register Duplicate Email (should fail)", "POST", f"{BASE}/auth/register/",
    body={"email":"newman@test.com","username":"newmanuser2","first_name":"N","last_name":"T","password":"TestPass123!","password_confirm":"TestPass123!"},
    tests=["pm.test('Duplicate returns 400', function(){ pm.response.to.have.status(400); });"]
))

auth_folder["item"].append(req(
    "Register Password Mismatch (should fail)", "POST", f"{BASE}/auth/register/",
    body={"email":"mismatch@test.com","username":"mismatchuser","first_name":"N","last_name":"T","password":"TestPass123!","password_confirm":"WrongPass!"},
    tests=["pm.test('Mismatch returns 400', function(){ pm.response.to.have.status(400); });"]
))

auth_folder["item"].append(req(
    "Login with Credentials", "POST", f"{BASE}/auth/login/",
    body={"email":"newman@test.com","password":"TestPass123!"},
    tests=[
        "pm.test('Login returns 200', function(){ pm.response.to.have.status(200); });",
        "var j = pm.response.json();",
        "pm.test('Has access token', function(){ pm.expect(j).to.have.property('access'); });",
        "pm.collectionVariables.set('access_token', j.access);",
        "pm.collectionVariables.set('refresh_token', j.refresh);"
    ]
))

auth_folder["item"].append(req(
    "Login Wrong Password (should fail)", "POST", f"{BASE}/auth/login/",
    body={"email":"newman@test.com","password":"WrongPassword!"},
    tests=["pm.test('Wrong password returns 401', function(){ pm.response.to.have.status(401); });"]
))

auth_folder["item"].append(req(
    "Refresh Token", "POST", f"{BASE}/auth/token/refresh/",
    body={"refresh":"{{refresh_token}}"},
    tests=[
        "pm.test('Refresh returns 200', function(){ pm.response.to.have.status(200); });",
        "var j = pm.response.json();",
        "pm.collectionVariables.set('access_token', j.access);"
    ]
))

auth_folder["item"].append(req(
    "Login as Admin", "POST", f"{BASE}/auth/login/",
    body={"email":"admin@megamart.com","password":"admin123"},
    tests=[
        "pm.test('Admin login returns 200', function(){ pm.response.to.have.status(200); });",
        "var j = pm.response.json();",
        "pm.collectionVariables.set('admin_access_token', j.access);"
    ]
))

col["item"].append(auth_folder)

# ── 2. USER PROFILE ──
profile_folder = {"name": "2. User Profile", "item": []}

profile_folder["item"].append(req(
    "Get Profile", "GET", f"{BASE}/users/profile/", auth=True,
    tests=[
        "pm.test('Profile returns 200', function(){ pm.response.to.have.status(200); });",
        "var j = pm.response.json();",
        "pm.test('Has email', function(){ pm.expect(j.email).to.eql('newman@test.com'); });"
    ]
))

profile_folder["item"].append(req(
    "Update Profile", "PUT", f"{BASE}/users/profile/", auth=True,
    body={"username":"newmanuser","first_name":"Updated","last_name":"Name"},
    tests=[
        "pm.test('Update returns 200', function(){ pm.response.to.have.status(200); });",
        "pm.test('Name updated', function(){ pm.expect(pm.response.json().first_name).to.eql('Updated'); });"
    ]
))

profile_folder["item"].append(req(
    "Get Profile Unauthenticated (should fail)", "GET", f"{BASE}/users/profile/",
    tests=["pm.test('Unauth returns 401', function(){ pm.response.to.have.status(401); });"]
))

profile_folder["item"].append(req(
    "Change Password", "POST", f"{BASE}/users/change-password/", auth=True,
    body={"current_password":"TestPass123!","new_password":"NewPass456!"},
    tests=["pm.test('Password changed 200', function(){ pm.response.to.have.status(200); });"]
))

profile_folder["item"].append(req(
    "Login with New Password", "POST", f"{BASE}/auth/login/",
    body={"email":"newman@test.com","password":"NewPass456!"},
    tests=[
        "pm.test('New password login 200', function(){ pm.response.to.have.status(200); });",
        "var j = pm.response.json();",
        "pm.collectionVariables.set('access_token', j.access);",
        "pm.collectionVariables.set('refresh_token', j.refresh);"
    ]
))

col["item"].append(profile_folder)

# ── 3. ADDRESSES ──
addr_folder = {"name": "3. Addresses", "item": []}

addr_folder["item"].append(req(
    "Create Address", "POST", f"{BASE}/users/addresses/", auth=True,
    body={"label":"Home","full_name":"Newman Tester","street_address":"123 Test St","city":"Mumbai","state":"MH","postal_code":"400001","country":"India"},
    tests=[
        "pm.test('Address created 201', function(){ pm.response.to.have.status(201); });",
        "pm.collectionVariables.set('address_id', pm.response.json().id);"
    ]
))

addr_folder["item"].append(req(
    "Create Second Address", "POST", f"{BASE}/users/addresses/", auth=True,
    body={"label":"Office","full_name":"Newman Office","street_address":"456 Work Ave","city":"Delhi","state":"DL","postal_code":"110001","country":"India"},
    tests=["pm.test('Second address 201', function(){ pm.response.to.have.status(201); });"]
))

addr_folder["item"].append(req(
    "List Addresses", "GET", f"{BASE}/users/addresses/", auth=True,
    tests=[
        "pm.test('List returns 200', function(){ pm.response.to.have.status(200); });",
        "pm.test('Has results', function(){ pm.expect(pm.response.json().results.length).to.be.above(0); });"
    ]
))

addr_folder["item"].append(req(
    "Get Single Address", "GET", f"{BASE}/users/addresses/{{{{address_id}}}}/", auth=True,
    tests=["pm.test('Get address 200', function(){ pm.response.to.have.status(200); });"]
))

addr_folder["item"].append(req(
    "Update Address", "PUT", f"{BASE}/users/addresses/{{{{address_id}}}}/", auth=True,
    body={"label":"Home Updated","full_name":"Newman Updated","street_address":"789 New St","city":"Pune","state":"MH","postal_code":"411001","country":"India"},
    tests=[
        "pm.test('Update 200', function(){ pm.response.to.have.status(200); });",
        "pm.test('City updated', function(){ pm.expect(pm.response.json().city).to.eql('Pune'); });"
    ]
))

col["item"].append(addr_folder)

# ── 4. CATEGORIES ──
cat_folder = {"name": "4. Categories", "item": []}

cat_folder["item"].append(req(
    "List All Categories", "GET", f"{BASE}/categories/",
    tests=[
        "pm.test('Categories 200', function(){ pm.response.to.have.status(200); });",
        "var j = pm.response.json();",
        "pm.test('Has categories', function(){ pm.expect(j.length).to.be.above(0); });",
        "pm.collectionVariables.set('category_slug', j[0].slug);"
    ]
))

col["item"].append(cat_folder)

# ── 5. PRODUCTS ──
prod_folder = {"name": "5. Products", "item": []}

prod_folder["item"].append(req(
    "List Products (Page 1)", "GET", f"{BASE}/products/",
    tests=[
        "pm.test('Products 200', function(){ pm.response.to.have.status(200); });",
        "var j = pm.response.json();",
        "pm.test('Has results array', function(){ pm.expect(j.results).to.be.an('array'); });",
        "pm.test('Has count', function(){ pm.expect(j.count).to.be.above(0); });",
        "pm.collectionVariables.set('product_id', j.results[0].id);"
    ]
))

prod_folder["item"].append(req(
    "List Products (Page 2)", "GET", f"{BASE}/products/?page=2",
    tests=["pm.test('Page 2 returns 200', function(){ pm.response.to.have.status(200); });"]
))

prod_folder["item"].append(req(
    "Filter by Category", "GET", f"{BASE}/products/?category__slug={{{{category_slug}}}}",
    tests=[
        "pm.test('Filter 200', function(){ pm.response.to.have.status(200); });",
        "pm.test('Has results', function(){ pm.expect(pm.response.json().results).to.be.an('array'); });"
    ]
))

prod_folder["item"].append(req(
    "Sort by Price Ascending", "GET", f"{BASE}/products/?ordering=price",
    tests=[
        "pm.test('Sort 200', function(){ pm.response.to.have.status(200); });",
        "var r = pm.response.json().results;",
        "if(r.length > 1) { pm.test('Sorted asc', function(){ pm.expect(parseFloat(r[0].price)).to.be.at.most(parseFloat(r[1].price)); }); }"
    ]
))

prod_folder["item"].append(req(
    "Sort by Price Descending", "GET", f"{BASE}/products/?ordering=-price",
    tests=["pm.test('Sort desc 200', function(){ pm.response.to.have.status(200); });"]
))

prod_folder["item"].append(req(
    "Search Products", "GET", f"{BASE}/products/?search=iPhone",
    tests=[
        "pm.test('Search 200', function(){ pm.response.to.have.status(200); });",
    ]
))

prod_folder["item"].append(req(
    "Filter by Price Range", "GET", f"{BASE}/products/?price__gte=1000&price__lte=50000",
    tests=["pm.test('Price range 200', function(){ pm.response.to.have.status(200); });"]
))

prod_folder["item"].append(req(
    "Get Product Detail", "GET", f"{BASE}/products/{{{{product_id}}}}/",
    tests=[
        "pm.test('Detail 200', function(){ pm.response.to.have.status(200); });",
        "var j = pm.response.json();",
        "pm.test('Has name', function(){ pm.expect(j).to.have.property('name'); });",
        "pm.test('Has price', function(){ pm.expect(j).to.have.property('price'); });",
        "pm.test('Has in_stock', function(){ pm.expect(j).to.have.property('in_stock'); });"
    ]
))

prod_folder["item"].append(req(
    "Get Non-existent Product (should fail)", "GET", f"{BASE}/products/99999/",
    tests=["pm.test('Not found 404', function(){ pm.response.to.have.status(404); });"]
))

col["item"].append(prod_folder)

# ── 6. CART ──
cart_folder = {"name": "6. Cart", "item": []}

cart_folder["item"].append(req(
    "Get Cart (empty)", "GET", f"{BASE}/cart/", auth=True,
    tests=[
        "pm.test('Cart 200', function(){ pm.response.to.have.status(200); });",
        "pm.test('Has items array', function(){ pm.expect(pm.response.json().items).to.be.an('array'); });"
    ]
))

cart_folder["item"].append(req(
    "Cart Unauthenticated (should fail)", "GET", f"{BASE}/cart/",
    tests=["pm.test('Unauth 401', function(){ pm.response.to.have.status(401); });"]
))

cart_folder["item"].append(req(
    "Add Item to Cart", "POST", f"{BASE}/cart/items/", auth=True,
    body={"product_id":"{{product_id}}","quantity":2},
    pre=["// product_id is set from products list"],
    tests=[
        "pm.test('Add item 201 or 200', function(){ pm.expect([200,201]).to.include(pm.response.code); });",
        "var items = pm.response.json().items;",
        "pm.test('Cart has items', function(){ pm.expect(items.length).to.be.above(0); });",
        "pm.collectionVariables.set('cart_item_id', items[0].id);"
    ]
))

cart_folder["item"].append(req(
    "Add Over Stock (should fail)", "POST", f"{BASE}/cart/items/", auth=True,
    body={"product_id":"{{product_id}}","quantity":99999},
    tests=["pm.test('Over stock 400', function(){ pm.response.to.have.status(400); });"]
))

cart_folder["item"].append(req(
    "Update Cart Item Quantity", "PUT", f"{BASE}/cart/items/{{{{cart_item_id}}}}/", auth=True,
    body={"quantity":1},
    tests=[
        "pm.test('Update 200', function(){ pm.response.to.have.status(200); });",
    ]
))

cart_folder["item"].append(req(
    "Get Cart After Update", "GET", f"{BASE}/cart/", auth=True,
    tests=[
        "pm.test('Cart 200', function(){ pm.response.to.have.status(200); });",
        "pm.test('Has subtotal', function(){ pm.expect(pm.response.json()).to.have.property('subtotal'); });"
    ]
))

col["item"].append(cart_folder)

# ── 7. ORDERS/CHECKOUT ──
order_folder = {"name": "7. Orders & Checkout", "item": []}

order_folder["item"].append(req(
    "Checkout", "POST", f"{BASE}/orders/checkout/", auth=True,
    body={"address_id":"{{address_id}}"},
    tests=[
        "pm.test('Checkout 201', function(){ pm.response.to.have.status(201); });",
        "var j = pm.response.json();",
        "pm.test('Has order id', function(){ pm.expect(j).to.have.property('id'); });",
        "pm.test('Status pending', function(){ pm.expect(j.status).to.eql('pending'); });",
        "pm.test('Has items', function(){ pm.expect(j.items.length).to.be.above(0); });",
        "pm.collectionVariables.set('order_id', j.id);"
    ]
))

order_folder["item"].append(req(
    "Checkout Empty Cart (should fail)", "POST", f"{BASE}/orders/checkout/", auth=True,
    body={"address_id":"{{address_id}}"},
    tests=["pm.test('Empty cart 400', function(){ pm.response.to.have.status(400); });"]
))

order_folder["item"].append(req(
    "List Orders", "GET", f"{BASE}/orders/", auth=True,
    tests=[
        "pm.test('Orders 200', function(){ pm.response.to.have.status(200); });",
        "pm.test('Has results', function(){ pm.expect(pm.response.json().results.length).to.be.above(0); });"
    ]
))

order_folder["item"].append(req(
    "Get Order Detail", "GET", f"{BASE}/orders/{{{{order_id}}}}/", auth=True,
    tests=[
        "pm.test('Order detail 200', function(){ pm.response.to.have.status(200); });",
        "var j = pm.response.json();",
        "pm.test('Has total', function(){ pm.expect(j).to.have.property('total'); });",
        "pm.test('Has shipping info', function(){ pm.expect(j).to.have.property('shipping_name'); });"
    ]
))

order_folder["item"].append(req(
    "Orders Unauthenticated (should fail)", "GET", f"{BASE}/orders/",
    tests=["pm.test('Unauth 401', function(){ pm.response.to.have.status(401); });"]
))

col["item"].append(order_folder)

# ── 8. CONTACT ──
contact_folder = {"name": "8. Contact", "item": []}

contact_folder["item"].append(req(
    "Submit Contact Message", "POST", f"{BASE}/contact/",
    body={"first_name":"John","last_name":"Doe","email":"john@test.com","subject":"Test Inquiry","message":"This is a test message from Newman."},
    tests=[
        "pm.test('Contact 201', function(){ pm.response.to.have.status(201); });",
        "pm.test('Has id', function(){ pm.expect(pm.response.json()).to.have.property('id'); });"
    ]
))

contact_folder["item"].append(req(
    "Submit Contact Missing Fields (should fail)", "POST", f"{BASE}/contact/",
    body={"first_name":"John"},
    tests=["pm.test('Missing fields 400', function(){ pm.response.to.have.status(400); });"]
))

col["item"].append(contact_folder)

# ── 9. ANALYTICS (Admin) ──
analytics_folder = {"name": "9. Analytics (Admin Only)", "item": []}

analytics_folder["item"].append(req(
    "Analytics Summary (as Admin)", "GET", f"{BASE}/analytics/summary/",
    auth=True,
    tests=[
        "pm.test('Analytics 200', function(){ pm.response.to.have.status(200); });",
    ],
    pre=["pm.request.headers.upsert({key:'Authorization', value:'Bearer ' + pm.collectionVariables.get('admin_access_token')});"]
))

analytics_folder["item"].append(req(
    "Analytics Unauthenticated (should fail)", "GET", f"{BASE}/analytics/summary/",
    tests=["pm.test('Unauth 401', function(){ pm.response.to.have.status(401); });"]
))

col["item"].append(analytics_folder)

# ── 10. LOGOUT ──
logout_folder = {"name": "10. Logout", "item": []}

logout_folder["item"].append(req(
    "Logout (Blacklist Token)", "POST", f"{BASE}/auth/logout/", auth=True,
    body={"refresh":"{{refresh_token}}"},
    tests=["pm.test('Logout 200', function(){ pm.response.to.have.status(200); });"]
))

logout_folder["item"].append(req(
    "Use Blacklisted Refresh (should fail)", "POST", f"{BASE}/auth/token/refresh/",
    body={"refresh":"{{refresh_token}}"},
    tests=["pm.test('Blacklisted 401', function(){ pm.response.to.have.status(401); });"]
))

col["item"].append(logout_folder)

# ── 11. ADDRESS DELETE (cleanup) ──
cleanup = {"name": "11. Cleanup", "item": []}
cleanup["item"].append(req(
    "Login Again for Cleanup", "POST", f"{BASE}/auth/login/",
    body={"email":"newman@test.com","password":"NewPass456!"},
    tests=[
        "pm.test('Login 200', function(){ pm.response.to.have.status(200); });",
        "pm.collectionVariables.set('access_token', pm.response.json().access);"
    ]
))
cleanup["item"].append(req(
    "Delete Address", "DELETE", f"{BASE}/users/addresses/{{{{address_id}}}}/", auth=True,
    tests=["pm.test('Delete 204', function(){ pm.response.to.have.status(204); });"]
))
col["item"].append(cleanup)

# Fix URLs with template vars
def fix_urls(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "raw" and isinstance(v, str):
                obj[k] = v.replace("{{{{", "{{").replace("}}}}", "}}")
            elif k == "path" and isinstance(v, list):
                obj[k] = [p.replace("{{{{", "{{").replace("}}}}", "}}") for p in v]
            else:
                fix_urls(v)
    elif isinstance(obj, list):
        for item in obj:
            fix_urls(item)

fix_urls(col)

with open("megamart_postman_collection.json", "w") as f:
    json.dump(col, f, indent=2)

print(f"Collection generated with {sum(len(folder['item']) for folder in col['item'])} requests across {len(col['item'])} folders.")
print("Saved to: megamart_postman_collection.json")
