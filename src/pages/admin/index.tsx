
import styled from 'styled-components';
import PageContainer from '@/components/PageContainer';
import { useRouter } from 'next/router';
import { useRequireAdmin } from '@/hooks/useAdminAuth';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text.light};
  }
`;

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const AdminCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
  }
`;

const CardIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CardDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.light};
  line-height: 1.5;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.light};
`;

export default function AdminDashboard() {
  const router = useRouter();
  
  // Use the admin authentication hook
  const { loading } = useRequireAdmin();

  const adminSections = [
    {
      title: 'Events',
      description: 'Manage events, schedules, and event details',
      icon: '📅',
      path: '/admin/events'
    },
    {
      title: 'Artists',
      description: 'Manage artist profiles and information',
      icon: '🎨',
      path: '/admin/artists'
    },
    {
      title: 'Raffles',
      description: 'Create and manage raffles for events',
      icon: '🎫',
      path: '/admin/raffles'
    },
    {
      title: 'Artwork',
      description: 'Manage artwork submissions and galleries',
      icon: '🖼️',
      path: '/admin/artwork'
    },
    {
      title: 'Orders',
      description: 'View and manage ticket orders',
      icon: '📋',
      path: '/admin/orders'
    },
    {
      title: 'Items',
      description: 'Manage merchandise and other items',
      icon: '🛍️',
      path: '/admin/items'
    },
    {
      title: 'Flyer Submissions',
      description: 'Review and approve community event flyers',
      icon: '📄',
      path: '/admin/flyer-submissions'
    },
    {
      title: 'Artist Submissions',
      description: 'Review and manage artist applications',
      icon: '🎭',
      path: '/admin/artist-submissions'
    }
  ];

  if (loading) {
    return (
      <PageContainer theme="dark">
        <LoadingContainer>
          Loading admin dashboard...
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="dark">
      <AdminContainer>
        <Header>
          <h1>Admin Dashboard</h1>
          <p>Manage your Art Night Detroit platform</p>
        </Header>

        <AdminGrid>
          {adminSections.map((section) => (
            <AdminCard key={section.path} onClick={() => router.push(section.path)}>
              <CardIcon>{section.icon}</CardIcon>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </AdminCard>
          ))}
        </AdminGrid>
      </AdminContainer>
    </PageContainer>
  );
} 