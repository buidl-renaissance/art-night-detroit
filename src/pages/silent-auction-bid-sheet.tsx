import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

const SilentAuctionBidSheet = () => {
  const printBidSheet = () => {
    window.print();
  };

  return (
    <>
      <Head>
        <title>Silent Auction Bid Sheet | Art Night Detroit</title>
        <meta name="description" content="Silent auction bid sheet template for Art Night Detroit" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <PageContainer>
        <BidSheetContainer>
          <ArtworkInfo>
            <ArtworkInfoLeft>
              <MuralsImage src="/images/murals-in-market.png" alt="Murals in the Market" />
            </ArtworkInfoLeft>
            <ArtworkInfoRight>
              <Title>ART NIGHT DETROIT <br /> SILENT AUCTION</Title>
              <AuctionDetails>
                {/* <DetailItem>
                  <DetailLabel>BID SHEET #</DetailLabel>
                  <DetailValue></DetailValue>
                </DetailItem> */}
                <DetailItem>
                  <DetailLabel>ARTIST:</DetailLabel>
                  <DetailValue></DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>STARTING BID:</DetailLabel>
                  <DetailValue>$</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>MIN. INCREMENT:</DetailLabel>
                  <DetailValue>$</DetailValue>
                </DetailItem>
              </AuctionDetails>
            </ArtworkInfoRight>
          </ArtworkInfo>

          <BidSheet>
            <BidTable>
              <BidTableHeader>
                <BidTableRow>
                  <BidTableHeaderCell style={{ width: '35%' }}>BIDDER NAME</BidTableHeaderCell>
                  <BidTableHeaderCell style={{ width: '45%', textAlign: 'center' }}>PHONE NUMBER</BidTableHeaderCell>
                  <BidTableHeaderCell style={{ width: '20%', textAlign: 'center' }}>BID</BidTableHeaderCell>
                </BidTableRow>
              </BidTableHeader>
              <BidTableBody>
                {Array.from({ length: 20 }, (_, index) => (
                  <BidTableRow key={index}>
                    <BidTableCell>
                      <BidLine>                                 </BidLine>
                    </BidTableCell>
                    <BidTableCell>
                      <BidLine>                                 </BidLine>
                    </BidTableCell>
                    <BidTableCell>
                      <BidLine>                                 </BidLine>
                    </BidTableCell>
                  </BidTableRow>
                ))}
              </BidTableBody>
            </BidTable>
          </BidSheet>

        </BidSheetContainer>

        <PrintButton onClick={printBidSheet}>
          Print Bid Sheet
        </PrintButton>
      </PageContainer>
    </>
  );
};

const PageContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
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

const BidSheetContainer = styled.div`
  width: 4.5in;
  height: 7.5in;
  background: white;
  display: flex;
  flex-direction: column;
  
  @media print {
    width: 4.5in;
    height: 7.5in;
  }
`;


const MuralsImage = styled.img`
  height: 125px;
  width: auto;
  display: block;
  margin: 0 auto;
`;



const Title = styled.h1`
  font-size: 1rem;
  font-weight: bold;
  line-height: 1.2;
  color: #000;
  margin: 0 0 0 0;
  font-family: "Baloo 2", sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: left;
  margin-top: 0.05in;
  margin-bottom: 0.1in;
`;

const ArtworkInfo = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.1in;
  border: 2px solid #000;
  border-bottom: 2px solid #000;
  background: #ffffff;
`;

const ArtworkInfoLeft = styled.div`
  flex: 0 0 auto;
  margin-right: 0.15in;
`;

const ArtworkInfoRight = styled.div`
  flex: 1;
`;

const AuctionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.05in;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.05in;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  margin-right: 0.15in;
  color: #000;
  font-size: 0.8rem;
`;

const DetailValue = styled.span`
  font-size: 0.8rem;
  letter-spacing: 1px;
  color: #000;
`;

const BidSheet = styled.div`
  border: 2px solid #000;
  margin-bottom: 0.1in;
  flex: 1;
  display: flex;
  flex-direction: column;
`;


const BidTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  flex: 1;
`;

const BidTableHeader = styled.thead`
  background: #f0f0f0;
`;

const BidTableRow = styled.tr`
  border-bottom: 1px solid #000;
  
  &:nth-child(even) {
    background: #f8f8f8;
  }
`;

const BidTableHeaderCell = styled.th`
  padding: 0.08in 0.08in;
  text-align: left;
  font-weight: bold;
  color: #000;
  border-right: 1px solid #000;
  font-size: 0.75rem;
  
  &:last-child {
    border-right: none;
  }
`;

const BidTableBody = styled.tbody`
  display: table-row-group;
  height: 100%;
`;

const BidTableCell = styled.td`
  padding: 0.14in 0.1in;
  border-right: 1px solid #000;
  vertical-align: top;
  
  &:last-child {
    border-right: none;
  }
`;

const BidLine = styled.span`
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  color: #000;
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


export default SilentAuctionBidSheet;
