import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

const TableNumbers = () => {
  const printNumbers = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>Table Numbers 1-24 | Art Night Detroit</title>
        <meta name="description" content="Table numbers 1-24 for Art Night Detroit events" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <PageContainer>
        <NumbersGrid>
          {Array.from({ length: 24 }, (_, index) => (
            <NumberCard key={index + 1}>
              <NumberText>{index + 1}</NumberText>
            </NumberCard>
          ))}
        </NumbersGrid>

        <PrintButton onClick={printNumbers}>
          Print Table Numbers
        </PrintButton>
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "Inter", sans-serif;
  background: #f8f8f8;
  padding: 20px;
  
  @media print {
    width: auto;
    height: auto;
    display: block;
    background: white;
    padding: 0;
  }
`;

const NumbersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 3in);
  grid-template-rows: repeat(12, 3in);
  gap: 0.25in;
  max-width: 6.5in; /* 2 * 3in + 1 * 0.25in gap */
  
  @media print {
    gap: 0.125in;
    max-width: 6.125in; /* 2 * 3in + 1 * 0.125in gap */
  }
`;

const NumberCard = styled.div`
  width: 3in;
  height: 3in;
  background: white;
  border: 2px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media print {
    box-shadow: none;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  /* Page break every 6 cards (3 rows of 2) to fit on 7.5" x 10" paper */
  &:nth-child(6n) {
    @media print {
      page-break-after: always;
    }
  }
`;

const NumberText = styled.span`
  font-size: 15rem;
  font-weight: bold;
  color: #000;
  font-family: "Baloo 2", sans-serif;
`;

const PrintButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 1000;
  
  &:hover {
    background: #0056b3;
  }
  
  @media print {
    display: none;
  }
`;

export default TableNumbers;
