import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import QRCode from 'react-qr-code';

const MoneyPrinterPage: React.FC = () => {

  return (
    <>
      <Head>
        <title>Money Printer | Art Night Detroit</title>
        <meta name="description" content="Money Printer QR Code" />
      </Head>
      <PageContainer>
        <Title>MONEY PRINTER</Title>
        <QRCodeContainer>
          <QRCode
            value={"https://artnightdetroit.com/bank"}
            size={600}
            level="Q"
            fgColor="#000000"
            bgColor="#FFFFFF"
          />
        </QRCodeContainer>
        <ScanText>SCAN HERE</ScanText>
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 5rem;
  font-weight: bold;
  color: black;
  margin: 0;
  text-align: center;
  font-family: "Baloo 2", sans-serif;
`;

const QRCodeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
`;

const ScanText = styled.p`
  font-size: 5rem;
  font-weight: bold;
  color: black;
  margin: 0;
  text-align: center;
  font-family: "Baloo 2", sans-serif;
`;

export default MoneyPrinterPage;
