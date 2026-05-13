# Role Constants
ROLE_ADMIN = "admin"
ROLE_USER = "user"

# Permission Mapping (for future scalability)
PERMISSIONS = {
    ROLE_ADMIN: ["manage_tickets", "post_announcements", "manage_rooms", "view_all_bookings"],
    ROLE_USER: ["raise_tickets", "book_rooms", "view_own_bookings"]
}
