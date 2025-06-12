import { NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Layout from "@/components/Layout";
import Head from "next/head";

const LogoutPage: NextPage = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await supabase.auth.signOut();
        router.push("/");
      } catch (error) {
        console.error("Error signing out:", error);
        router.push("/");
      }
    };

    handleLogout();
  }, [router, supabase.auth]);

  return (
    <Layout>
      <Head>
        <title>Logging Out - Art Night Detroit</title>
        <meta name="description" content="Logging out of Art Night Detroit" />
      </Head>
      <LogoutContainer>
        <LogoutMessage>Logging you out...</LogoutMessage>
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

const LogoutMessage = styled.h1`
  font-family: "Bungee", sans-serif;
  font-size: 2rem;
  color: #ffdd3c;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

export default LogoutPage; 