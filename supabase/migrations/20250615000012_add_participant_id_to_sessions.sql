-- Add participant_id column to qr_code_sessions table
alter table qr_code_sessions 
add column participant_id uuid references participants(id);

-- Add index for better query performance
create index idx_qr_code_sessions_participant_id on qr_code_sessions(participant_id); 