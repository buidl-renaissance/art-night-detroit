import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';

interface RaffleFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  max_tickets: number;
  ticket_price: number;
}

export default function CreateRaffle() {
  const [formData, setFormData] = useState<RaffleFormData>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    max_tickets: 100,
    ticket_price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if user is admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        throw new Error('Not authorized');
      }

      // Create the raffle
      const { error: createError } = await supabase
        .from('raffles')
        .insert([{
          ...formData,
          created_by: session.user.id,
          status: 'draft'
        }])
        .select()
        .single();

      if (createError) throw createError;

      router.push('/admin/raffles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_tickets' || name === 'ticket_price' ? Number(value) : value
    }));
  };

  return (
    <PageContainer theme="dark" width="medium">
      <Header>
        <Title>Create New Raffle</Title>
      </Header>

      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormGroup>
          <Label htmlFor="name">Raffle Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter raffle name"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter raffle description"
            required
            rows={4}
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              name="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="max_tickets">Maximum Tickets</Label>
            <Input
              id="max_tickets"
              name="max_tickets"
              type="number"
              min="1"
              value={formData.max_tickets}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="ticket_price">Ticket Price ($)</Label>
            <Input
              id="ticket_price"
              name="ticket_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.ticket_price}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </FormRow>

        <ButtonGroup>
          <Button type="button" onClick={() => router.back()} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Raffle'}
          </Button>
        </ButtonGroup>
      </Form>
    </PageContainer>
  );
}

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #ffd700;
  font-family: var(--font-decorative);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  color: #e0e0e0;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ffd700;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 1rem;
  transition: border-color 0.2s;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #ffd700;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ variant?: 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  background: ${({ variant }) => variant === 'secondary' ? 'transparent' : '#ffd700'};
  color: ${({ variant }) => variant === 'secondary' ? '#e0e0e0' : '#121212'};
  border: ${({ variant }) => variant === 'secondary' ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  font-size: 0.9rem;
  text-align: center;
`; 