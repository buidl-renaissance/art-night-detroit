import { NextPage } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Layout from "@/components/Layout";
import Head from "next/head";

const LogoutPage: NextPage = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Layout>
      <Head>
        <title>Logout - Art Night Detroit</title>
        <meta name="description" content="Logout from Art Night Detroit" />
      </Head>
      <LogoutContainer>
        <LogoutCard>
          <LogoutTitle>Logout</LogoutTitle>
          <LogoutMessage>
            Are you sure you want to logout from your account?
          </LogoutMessage>
          <ButtonContainer>
            <CancelButton onClick={handleCancel} disabled={loading}>
              Cancel
            </CancelButton>
            <LogoutButton onClick={handleLogout} disabled={loading}>
              {loading ? "Logging out..." : "Logout"}
            </LogoutButton>
          </ButtonContainer>
        </LogoutCard>
      </LogoutContainer>
    </Layout>
  );
};

const LogoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #002b5c;
  padding: 2rem;
`;

const LogoutCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const LogoutTitle = styled.h1`
  font-family: "Bungee", sans-serif;
  font-size: 2rem;
  color: #ffdd3c;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
`;

const LogoutMessage = styled.p`
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const LogoutButton = styled(Button)`
  background: #dc2626;
  color: #ffffff;

  &:hover:not(:disabled) {
    background: #b91c1c;
  }
`;

export default LogoutPage; 