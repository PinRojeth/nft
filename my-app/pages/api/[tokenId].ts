// Next.js API route support: https://nextjs.org/docs/api-routes/introduction


export default function handler(req: { query: { tokenId: any; }; }, res: { json: (arg0: { name: string; description: string; image: string, external_link:string, seller_fee_basis_points: number, fee_recipient:string }) => any; }) {
  const tokenId = req.query.tokenId;
  
  const name = `Crypto Dev #${tokenId}`;
  const description = "CryptoDevs is an NFT Collection for Web3 Developers";
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${Number(tokenId) - 1}.svg`
  const external_link = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/`
  const seller_fee_basis_points = 100
  const fee_recipient = "0x3c1a9e1bF7D4e1c8b9b1C9A7E931dFCafD2867ba"

  return res.json ({
    name: name,
    description: description,
    image: image,
    external_link: external_link,
    seller_fee_basis_points: seller_fee_basis_points,
    fee_recipient: fee_recipient
  });
  };




