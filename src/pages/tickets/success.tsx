import { useRouter } from "next/router";
import styled from "styled-components";
import PageContainer from "@/components/PageContainer";
import { useIssueTickets } from "@/hooks/useIssueTickets";
import { useOrderDetails } from "@/hooks/useOrderDetails";
import { useEffect } from "react";

const SuccessContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0rem;
  color: ${({ theme }) => theme.colors.text.primary};

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    color: ${({ theme }) => theme.colors.text.light};
    line-height: 1.6;
  }
`;

const SuccessMessage = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const OrderDetails = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: ${({ theme }) => theme.colors.text.light};
    }

    .value {
      font-weight: bold;
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.light};
`;

const ErrorMessage = styled.div`
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const TicketList = styled.div`
  margin-top: 2rem;
`;

const TicketItem = styled.div`
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    margin: 0;
    font-size: 1.2rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const IssueButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

  &:disabled {
    background: ${({ theme }) => theme.colors.text.light};
    cursor: not-allowed;
  }
`;

export default function Success() {
  const router = useRouter();
  const { order, loading, error, setOrder } = useOrderDetails(
    router.query.order_id as string
  );
  const { issueOrderTickets, isIssuing, error: issueError } = useIssueTickets();

  useEffect(() => {
    const issueTickets = async () => {
      if (!order?.id) return;
      await issueOrderTickets(order.id, (updatedOrder) => {
        setOrder(updatedOrder);
      });
    };
    if (order?.id) {
      issueTickets();
    }
  }, [order?.id]);

  if (loading) {
    return <LoadingMessage>Loading order details...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  if (!order) {
    return <ErrorMessage>Order not found</ErrorMessage>;
  }

  return (
    <PageContainer theme="dark">
      <SuccessContainer>
        <SuccessMessage>Thank you for your purchase!</SuccessMessage>
        <OrderDetails>
          <h2>Order Details</h2>
          <p>Order ID: {order.id}</p>
          <p>Number of Tickets: {order.number_of_tickets}</p>
          <p>Status: {order.status}</p>
          <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
          {order.raffle && <p>Raffle: {order.raffle.name}</p>}
          {order.artist && <p>Artist: {order.artist.name}</p>}
        </OrderDetails>

        {issueError && <ErrorMessage>Error: {issueError}</ErrorMessage>}

        {order.tickets && order.tickets.length > 0 && (
          <TicketList>
            <h2>Your Tickets</h2>
            {order.tickets.map((ticket) => (
              <TicketItem key={ticket.id}>
                <p>Ticket Number: {ticket.ticket_number}</p>
                <p>
                  Issued: {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </TicketItem>
            ))}
          </TicketList>
        )}
      </SuccessContainer>
    </PageContainer>
  );
}
