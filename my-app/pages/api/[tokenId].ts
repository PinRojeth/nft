// Next.js API route support: https://nextjs.org/docs/api-routes/introduction


export default function handler(req: { query: { tokenId: any; }; }, res: { json: (arg0: { name: string; description: string; image: string; }) => any; }) {
  const tokenId = req.query.tokenId;
  
  const name = `Crypto Dev #${tokenId}`;
  const description = "CryptoDevs is an NFT Collection for Web3 Developers";
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${Number(tokenId) - 1}.svg`
  
  return res.json ({
    name: name,
    description: description,
    image: image,
  });
  };




