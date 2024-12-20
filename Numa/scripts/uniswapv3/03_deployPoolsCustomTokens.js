require('dotenv').config()
TETHER_ADDRESS = process.env.TETHER_ADDRESS
USDC_ADDRESS = process.env.USDC_ADDRESS
TOKEN_ADDRESS = process.env.TOKEN_ADDRESS
WETH_ADDRESS = process.env.WETH_ADDRESS
FACTORY_ADDRESS = process.env.FACTORY_ADDRESS
SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS
NFT_DESCRIPTOR_ADDRESS = process.env.NFT_DESCRIPTOR_ADDRESS
POSITION_DESCRIPTOR_ADDRESS = process.env.POSITION_DESCRIPTOR_ADDRESS
POSITION_MANAGER_ADDRESS = process.env.POSITION_MANAGER_ADDRESS

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const { Pool, Position, nearestUsableTick,encodeSqrtRatioX96 ,toHex } = require('@uniswap/v3-sdk')

const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
const {promisify} = require("util");
const fs = require("fs");
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

const provider = ethers.provider

function encodePriceSqrt(reserve1, reserve0) 
{
  let a = new bn(reserve1.toString());
  console.log(a);
  let b = a.div(reserve0.toString());
  console.log(b);
  let c = b.sqrt();

  let d =  c.mul(new bn(2).pow(96));
  let e = BigInt(d);//d.integerValue(3);
  console.log(e);
  let f = e.toString()
  console.log(f);
  return BigInt(f);

  //return BigInt("42");
  // return BigNumber.from(
  //   new bn(reserve1.toString())
  //     .div(reserve0.toString())
  //     .sqrt()
  //     .multipliedBy(new bn(2).pow(96))
  //     .integerValue(3)
  //     .toString()
  // )
}
const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  provider
)

const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  provider
)



async function main() {
  const [owner] = await ethers.getSigners();
  let fee = 500;
  let price = encodePriceSqrt(1, 1);//toHex(encodeSqrtRatioX96(1, 1));
  //const tokenEth500 = await deployPool(TOKEN_ADDRESS, WETH_ADDRESS,500, encodePriceSqrt(1, 1))
  //const tokenEth500 = await deployPool(TOKEN_ADDRESS, WETH_ADDRESS,500,  toHex(encodeSqrtRatioX96(1, 1)));
  //const tokenEth500 = await deployPool(TOKEN_ADDRESS, WETH_ADDRESS,500,  encodePriceSqrt(1, 1).toString());

  // ko
  // let token0 = TOKEN_ADDRESS;
  // let token1 = WETH_ADDRESS;

  // ok
  // let token0 = TETHER_ADDRESS;
  // let token1 = USDC_ADDRESS;

  let token1 = TOKEN_ADDRESS;
  let token0 = WETH_ADDRESS;

  await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
    token1,
    token0,
    fee,
    price,//price,
    { gasLimit: 5000000 }
  );

  let poolAddress = await factory.connect(owner).getPool(
    token1,
    token0,
    fee
  );
  console.log(poolAddress);

 
  let addresses = [
    `TOKEN_ETH_USDC_500=${poolAddress}`
  ]
  const data = '\n' + addresses.join('\n')
  const writeFile = promisify(fs.appendFile);
  const filePath = '.env';
  return writeFile(filePath, data)
      .then(() => {
        console.log('Addresses recorded.');
      })
      .catch((error) => {
        console.error('Error logging addresses:', error);
        throw error;
      });
}

/*
  npx hardhat run --network localhost scripts/03_deployPools.js
*/


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
