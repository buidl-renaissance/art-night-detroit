-- Add foreign key relationship between ticket_orders and auth.users
ALTER TABLE ticket_orders
ADD CONSTRAINT fk_ticket_orders_users
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create a view that joins ticket_orders with auth.users for easier querying
CREATE OR REPLACE VIEW ticket_orders_with_users AS
SELECT 
    ticket_orders.*,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'is_admin' as is_admin
FROM ticket_orders
JOIN auth.users au ON ticket_orders.user_id = au.id;

-- Grant access to the view
GRANT SELECT ON ticket_orders_with_users TO authenticated;
GRANT SELECT ON ticket_orders_with_users TO service_role;
