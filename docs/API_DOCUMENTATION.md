# StayEase API Documentation

Base URL (development): `http://localhost:5000/api` (the Vite dev server proxies `/api`).

- Format: JSON. Success responses contain `"success": true`; errors return `{ "success": false, "message": "...", "details": { field: "message" } }`.
- Auth: an `HttpOnly` cookie named `stayease_token` set by login/register. Send requests with credentials (`withCredentials: true` in Axios).
- Roles: `customer`, `admin`. Admin endpoints return `401` when not logged in and `403` for non-admins. The role is checked against the database on every request.
- Dates are `YYYY-MM-DD`. Money is INR, serialized as numbers with 2 decimals.
- Rate limits: 600 requests / 15 min per IP overall; 30 / 15 min on login, register and password change.

Common status codes: `400` validation, `401` not authenticated, `403` forbidden, `404` not found, `409` conflict (e.g. room already booked), `429` rate limited, `500` server error.

## Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | none | Liveness check |

## Auth
| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/auth/register` | none | `name, email, phone, password` | Create a customer account and start a session (201). Password: 8-72 chars with a letter and a number. |
| POST | `/auth/login` | none | `email, password` | Start a session. Returns `user`. |
| POST | `/auth/logout` | none | - | Clear the session cookie. |
| GET | `/auth/me` | customer/admin | - | Current user. |
| PUT | `/auth/profile` | customer/admin | `name, phone, address?` | Update own profile. |
| PUT | `/auth/password` | customer/admin | `currentPassword, newPassword` | Change password. |

## Rooms (public)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/rooms` | Search and filter active rooms. |
| GET | `/rooms/featured` | Featured rooms for the home page. |
| GET | `/rooms/meta` | `types`, `amenities` and `price` bounds (`min_price`, `max_price`, `max_capacity`). |
| GET | `/rooms/testimonials` | Featured guest reviews. |
| GET | `/rooms/:id` | Room detail plus `bookedRanges` (upcoming pending/confirmed stays). |

`GET /rooms` query parameters (all optional):

| Param | Description |
|-------|-------------|
| `checkIn`, `checkOut` | Both required together. Adds `available` per room (no overlapping pending/confirmed booking and not under maintenance). |
| `guests` | Minimum capacity |
| `category` | Room type id |
| `minPrice`, `maxPrice` | Price per night range |
| `amenities` | Comma separated amenity ids; rooms must have all |
| `search` | Keyword in name, description or category |
| `sort` | `recommended` (default), `price_asc`, `price_desc`, `capacity_desc` |
| `onlyAvailable` | `true` to hide unavailable rooms |

Response: `{ success, count, rooms: [{ id, room_number, name, description, price_per_night, capacity, bed_type, size_sqft, floor_no, image_url, gallery[], category, amenities[{id,name,icon}], available }] }`

## Bookings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/bookings/quote` | none | Price and availability for a stay. Body: `roomId, checkIn, checkOut, guests`. |
| POST | `/bookings` | customer/admin | Create a reservation. |
| GET | `/bookings/my` | customer/admin | Own bookings (each includes `can_cancel`, `refund_percent`, `cancel_note`). |
| GET | `/bookings/:id` | owner or admin | One booking. Other users receive 404. |
| POST | `/bookings/:id/cancel` | owner or admin | Cancel. Body: `reason?`. |

**Quote response** `quote`: `nights, pricePerNight, roomCharges, taxRate, taxAmount, serviceFeeRate, serviceFee, totalAmount, available, reason, room{...}`.

**Create body**: `roomId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests?, paymentMethod` where `paymentMethod` is `simulated_card` (booking `confirmed`, payment `success`, simulated) or `pay_at_hotel` (booking `pending`, payment `pending`). The server recomputes all amounts. A booking reference such as `SE-20261010-K7M2QX` is generated. If the room was taken in the meantime the API returns `409`.

**Cancellation rules (customers)**: 2+ days before check-in refunds 100%; 1 day before refunds 50%; on/after the check-in day returns `400`. Admin cancellations refund 100%. Paid bookings become payment status `refunded` or `partially_refunded`; unpaid ones become `cancelled`.

## Admin (all require admin role)

### Dashboard and reports
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/stats` | Room counts (total, available, occupied, maintenance), reservations by status, revenue (all-time and this month), customers, today's arrivals/departures, recent bookings. |
| GET | `/admin/reports?from=&to=` | Defaults to the last 30 days; max 366 days. Returns `summary`, `bookingsByStatus`, `daily[{day, revenue, payments, occupiedRooms, occupancyPct}]`, `topRooms`. |

### Rooms, types, amenities
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/rooms?search=&type=&status=` | All rooms; `status` = `active`, `inactive`, `maintenance`, `occupied`. |
| POST | `/admin/rooms` | Create. |
| PUT | `/admin/rooms/:id` | Update. |
| PATCH | `/admin/rooms/:id/active` | Body `{ isActive }`. Deactivation is refused (409) while upcoming reservations exist. |
| GET | `/admin/room-types` | List with room counts. |
| POST | `/admin/room-types` | Body `name, description?, sortOrder?`. |
| PUT | `/admin/room-types/:id` | Update. |
| GET | `/admin/amenities` | List amenities. |

Room body: `roomNumber, name, roomTypeId, description, pricePerNight, capacity (1-10), bedType, sizeSqft?, floorNo?, imageUrl?, gallery[] (http/https URLs, max 8), operationalStatus (available|maintenance), isFeatured, isActive, amenityIds[]`.

### Reservations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/bookings?search=&status=&stay=&from=&to=` | Up to 500 newest bookings. `status`: pending, confirmed, cancelled, completed. `stay`: not_arrived, checked_in, checked_out. `from`/`to` filter on stay overlap. |
| PATCH | `/admin/bookings/:id/status` | Body `{ status: "confirmed" | "cancelled", reason? }`. Only pending bookings can be confirmed. |
| PATCH | `/admin/bookings/:id/stay` | Body `{ stayStatus: "checked_in" | "checked_out" }`. Check-in requires a confirmed booking within the stay dates. Check-out completes the booking and settles any pending pay-at-hotel payment. |

### Customers
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/customers?search=&status=` | Customers with `bookings_count` and `total_spent`. |
| GET | `/admin/customers/:id` | Customer plus booking history. |
| PATCH | `/admin/customers/:id/active` | Body `{ isActive }`. Deactivated users cannot log in and existing sessions stop working. |

## Status model
- Booking `status`: `pending` -> `confirmed` -> `completed`, or `cancelled`. Confirmed bookings whose check-out date has passed are marked `completed`; pending ones past check-out expire to `cancelled` (done lazily when bookings are listed).
- `stay_status`: `not_arrived` -> `checked_in` -> `checked_out`.
- Payment `status`: `pending`, `success`, `failed`, `cancelled`, `refunded`, `partially_refunded`.
