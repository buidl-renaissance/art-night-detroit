-- Add foreign key relationship between ticket_orders and profiles
ALTER TABLE ticket_orders
ADD CONSTRAINT fk_ticket_orders_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Create a view that joins ticket_orders with profiles for easier querying
CREATE OR REPLACE VIEW ticket_orders_with_profiles AS
SELECT 
    to.*,
    p.email,
    p.full_name,
    p.is_admin
FROM ticket_orders to
JOIN profiles p ON to.user_id = p.id;

-- Grant access to the view
GRANT SELECT ON ticket_orders_with_profiles TO authenticated;
GRANT SELECT ON ticket_orders_with_profiles TO service_role;
