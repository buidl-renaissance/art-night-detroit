import { useRouter } from "next/router";
import Link from "next/link";
import styled from "styled-components";
import PageContainer from "@/components/PageContainer";
import { useIssueTickets } from "@/hooks/useIssueTickets";
import { useOrderDetails } from "@/hooks/useOrderDetails";
import { useEffect } from "react";

export default function Success() {
  const router = useRouter();
  const { order, loading, error, setOrder } = useOrderDetails(
    router.query.order_id as string
  );
  const { issueOrderTickets, isIssuing, error: issueError } = useIssueTickets();

  useEffect(() => {
    const handleIssueTickets = async () => {
      if (!order?.id) return;
      await issueOrderTickets(order.id, (updatedOrder) => {
        setOrder(updatedOrder);
      });
    };
    if (order?.status !== "completed" && order?.tickets?.length === 0) {
      handleIssueTickets();
    }
  }, [order, issueOrderTickets, setOrder]);

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
            <h2>Your Issued Tickets</h2>
            {order.tickets.map((ticket) => (
              <TicketItem key={ticket.id}>
                <TicketNumber>Ticket #{ticket.ticket_number}</TicketNumber>
              </TicketItem>
            ))}
          </TicketList>
        )}

        {order.raffle_id && (
          <RaffleButton href={`/raffles/${order.raffle_id}`}>
            View Raffle
          </RaffleButton>
        )}

        {isIssuing && (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        )}
      </SuccessContainer>
    </PageContainer>
  );
}


const SuccessContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const SuccessMessage = styled.div`
  margin-bottom: 2rem;
  font-size: 1.2rem;
`;

const OrderDetails = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: left;

  h2 {
    color: #fff;
    margin-bottom: 1rem;
  }

  p {
    color: #ccc;
    margin: 0.5rem 0;
  }
`;

const LoadingMessage = styled.div`
  color: #fff;
  font-size: 1.2rem;
  text-align: center;
  padding: 2rem;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 1.2rem;
  text-align: center;
  padding: 2rem;
`;

const TicketList = styled.div`
  margin-top: 2rem;
  text-align: left;

  h2 {
    color: #fff;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }
`;

const TicketItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(10px);
  }
`;

const TicketNumber = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const RaffleButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  margin-top: 2rem;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    background: linear-gradient(135deg, #2980b9, #3498db);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;