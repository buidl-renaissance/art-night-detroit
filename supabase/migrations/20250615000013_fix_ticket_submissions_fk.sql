-- Drop the existing foreign key constraint
ALTER TABLE ticket_submissions 
DROP CONSTRAINT IF EXISTS ticket_submissions_ticket_id_fkey;

-- Re-add the foreign key constraint with CASCADE delete
ALTER TABLE ticket_submissions 
ADD CONSTRAINT ticket_submissions_ticket_id_fkey 
FOREIGN KEY (ticket_id) 
REFERENCES tickets(id) 
ON DELETE CASCADE; 