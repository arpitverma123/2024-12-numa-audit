
# Numa Audit contest details

- Join [Sherlock Discord](https://discord.gg/MABEWyASkp)
- Submit findings using the issue page in your private contest repo (label issues as med or high)
- [Read for more details](https://docs.sherlock.xyz/audits/watsons)

# Q&A

### Q: On what chains are the smart contracts going to be deployed?
Arbitrum, Base, Ethereum
___

### Q: If you are integrating tokens, are you allowing only whitelisted tokens to work with the codebase or any complying with the standard? Are they assumed to have certain properties, e.g. be non-reentrant? Are there any types of [weird tokens](https://github.com/d-xo/weird-erc20) you want to integrate?
N/A.

However, we will only allow synthetics to be added which have a Chainlink price feed.
___

### Q: Are there any limitations on values set by admins (or other roles) in the codebase, including restrictions on array lengths?
All contract owners and admins are trusted. 

All fee addresses (addresses that receive fees) are trusted.

We have a lot of parameters that will be finely tuned and updated by contracts owners. We consider that contracts owners won’t setup weird values or values that could break the protocol.

We consider admins will only setup legit and workable values.

I don’t think we have any limitations. But we do have a list of hardcoded variables that can be updated. 

Important to note that after the variables are considered working as intended and require not further tweaking, then owner functions can be renounced to make the system immutable.

VAULT

fee address
Address the receives fees from vault, can be a contract (staking contract not implemented yet)

rwd address
Address the receives lst rewards from vault, can be a contract (staking contract not implemented yet)

buy_fee
Example: 0.95 ether → 5% buy fee

Sell_fee
Example: 0.95 ether → 5% sell fee

fees sent to fee address: percentage of buy/sell fee in base 1000
Example: 200 → 20% of fees sent to fee_address

feesMaxAmountPct: max percentage of amount that can be sent to fee_address
Example: 50 → 5%

decay values: 
initialremovedsupply
decayPeriod
initialremovedsupplyLP
decayPeriodLP
constantRemovedSupply

Example values:
500 000 x 1e18
365 days
800 000 x 1e18
400 days
100 000 x 1e18
→
100 000 numas are removed from supply (not accounted for) 
500 000 are removed and put back in supply linearly during 365 days
800 000 are removed and put back in supply linearly during 400 days

max_percent: max buyamount (percentage of vault’s balance)
Example value:
100 → a buy can not be worth more than 10% of vault balance

maxBorrow: reth max borrow amount for lending protocol
Example:
500 rEth → 500 reth max can be borrowed from vault

cf_liquid_warning: cf that limits max borrowable amount
Example:
2000 mean 200% which means we limit borrowable amount so that our vault liquidity (vault’s balance) is worth more than 200% of synthetics total value

maxLstProfitForLiquidations: max lst profit for liquidations (unit = rEth)
Example:
0.1 rEth →liquidation profit will be 0.1 reth maximum, the surplus is “kept” by the vault (either burnt if numa, or kept in vault’s balance if reth)

minBorrowAmountAllowPartialLiquidation : for reth borrowers liquidations, amount above which partial liquidations are allowed
Example:
minBorrowAmountAllowPartialLiquidation = 10 rEth 
If a borrowBalance (lst token) is > 10 rEth, then liquidators are allowed to do partial liquidations. (example borrowBalance = 15 rEth, liquidator can liquidate 10 rETh, then 5 rETh)

Sell_fee PID
cf_liquid_severe (used for sell_fee debasing)
When globalLiquidCF ((total eth balance excluding debts) / (total synth value en Eth)) is < cf_liquid_severe we start increasing vault sell_fee.
Example value: 1500 (1.5 base 1000)
→ we start increasing sell_fee when eth balance < 1.5*total_synth_value
If we are back above, we start decreasing sell_fee (until initial value)

sell_fee_debaseValue
Value added to sell fee at each step when currentLiquidCF < cf_liquid_severe
Example value: 0.01 ether

sell_fee_rebaseValue
Value removed from sell fee at each step when currentLiquidCF >= cf_liquid_severe
Example value: 0.01 ether

sell_fee_minimum
Minimum sell_fee value. (in fact it’s a max, but the parameter stores 1 - sell_fee, hence 0.95 for a 5% sell fee.
Example value: 0.6 ether → sell_fee can not go higher than 40%

sell_fee_deltaRebase
Delta time for rebase
Example value: 24h, if above cf_liquid_severe we rebase every 24h

sell_fee_deltaDebase
Delta time for debase
Example value: 24h, if below cf_liquid_severe we rebase every 24h

Full sell_fee algo,here (considering lastSellFee is the time debased sell_fee) will help understand the next 2 parameters:

   (, , uint criticalScaleForNumaPriceAndSellFee, ) = getSynthScaling();

        uint sell_fee_increaseCriticalCF = ((BASE_1000 -
            criticalScaleForNumaPriceAndSellFee) * 1 ether) / BASE_1000;
        // add a multiplier on top
        sell_fee_increaseCriticalCF =
            (sell_fee_increaseCriticalCF * sell_fee_criticalMultiplier) /
            1000;

        // here we use original fee value increase by this factor
        uint sell_fee_criticalCF;

        if (sell_fee > sell_fee_increaseCriticalCF)
            sell_fee_criticalCF = sell_fee - sell_fee_increaseCriticalCF;

        // clip it by min value
        if (sell_fee_criticalCF < sell_fee_minimum_critical)
            sell_fee_criticalCF = sell_fee_minimum_critical;

        uint sell_fee_result = lastSellFee;
        // Whichever sell fee is greater should be used at any given time
        if (sell_fee_criticalCF < sell_fee_result)
            sell_fee_result = sell_fee_criticalCF;




sell_fee_minimum_critical: maximum sell_fee in crital cf mode
Minimum sell_fee value computed from critical_scale (cf full algo)

sell_fee_criticalMultiplier: multiplier applied on sell_fee when it takes a value from synth scaling (critical_cf mode)
Example value: 10000 (base 1000) is a x10 multiplier


Buy_fee PID

buyPID_decAmt
Example value: 0.006 ether

buyPID_incAmt : 
Example value: 0.006 ether

buyPID_decMultiplier: 
Example value: 10

buyPID_incTriggerPct: 
Example value: 20 (2%)

buyPID_decTriggerPct:
Example value: 25 (2.5%)

buyPID_incMaxRate: 
Example value: 0.0166 ether

buyFee_max:
Example value: 0.7 ether

twapPID:
Example value: 900 (15 min twap)

nextCheckBlockWindowDelta
Example value: 4 hours



Synthetics

cf_warning
When globalCF ((total eth balance + debts) / (total synth value en Eth)) is < cf_warning we forbid minting synthetics
Example value: 1700 (1.7 base 1000)

cf_severe
When globalCF ((total eth balance + debts) / (total synth value en Eth)) is < cf_severe we debasing synthetics (we scale their burn value)
Example value: 1500 (1.5 base 1000)
→ we debase synthetics when (eth balance + debts) < 1.5*total_synth_value
If we are back above, we rebase synthetics (until initial value)

cf_critical
Example value: critical_cf = 1100
If globalCF < critical_cf, (total eth balance < 1.1 x total synth value
criticalDebaseFactor = (currentCF * BASE_1000) / cf_critical
We scale synthetics total value used in numa price computation (vaultmanager) by criticalDebaseFactor → this will clip the numa price to a minimum value. (If synthetics have already more debased than this factor, we do nothing)
We also use criticalDebaseFactor in sell_fee computation formula
We scale synthetics burn price by criticalDebaseFactor / criticalDebaseMult

debaseValue
Synthetics burn value debase value at each time step
Example value: 20 (base 1000)
Scale = scale - 20/1000 at each time step
For example, first time a debasing occurs (because we are below cf_severe) 
synthetic burn value = synthetic burn value x (1 - 0.02)  = synthetic burn value x (0.98)

rebaseValue
Synthetics burn value rebase value at each time step
Example value: 30 (base 1000)
Scale = scale + 30/1000 at each time step
Let’s say synthetics debased to 0.8, if we start rebase (because we are back above cf_severe)
synthetic burn value = synthetic burn value x (0.8 + 0.03)  = synthetic burn value x (0.83)

minimumScale
Minimum scaling of synthetics
Example value 500 (base 1000),
Synthetics burn value scaling can not go below 0.5

criticalDebaseMult:factor applied on burnPrice when critical_cf is reached
Example value: 1100 (base 1000)
Synth_critical_scale = Synth_critical_scale/ 1.1 

deltaRebase
Time step for synthetics rebasing
Example value: 24h, we rebase rebaseValue avery 24h if we are above cf_severe

deltaDebase
Time step for synthetics debasing
Example value: 24h, we debase debaseValue avery 24h if we are below cf_severe


Printer

printAssetFeeBps 
Example value 500 meaning a 5% fee

burnAssetFeeBps
Example value 800 meaning a 8% fee

swapAssetFeeBps
Example value 300 meaning a 3% fee

Fee_address: address that receive fees from synthetics mint/burn/swaps

printBurnAssetFeeSentBps: percentage of fees to be sent to fee_address (only for burn/mints, for swaps everything is sent to fee_address)
Example value 5000 means 50% of fees are sent to fee_address 


PrinterOracle

intervalshort: short interval for TWAP
Example:
180 (3 minutes)

intervalLong: long interval for TWAP
Example:
1800 (30 minutes)

_maxSpotOffsetBps:used to modulate the weight of the spot price in numa pricing for synthetics. See white paper for more precision.

numasyntheticMintPrice=min(numabuyPrice,numaLP15minPrice,numaLP30minPrice,numaLPspotPrice*(1+maxSpotOffsetPct))

numasyntheticRetirePrice=max(numasellPrice,numaLP15minPrice,numaLP30minPrice,numaLPspotPrice*(1-maxSpotOffsetPct))

Where maxSpotOffsetPct is an admin modifiable offset percentage variable, default ~1.45%
1.45% represents the estimated natural peg variance caused by sequential fees;

example value
145 → 1.45%


Lending/leverage

interest rate model parameters for cNuma
interest rate model parameters for cReth
cnuma collateral factor
creth collateral factor
close factor
_setLiquidationIncentive
Standard compound parameters, we can trust contract owners to setup them well according to protocol needs and tokenomics.

___

### Q: Are there any limitations on values set by admins (or other roles) in protocols you integrate with, including restrictions on array lengths?
No
___

### Q: Is the codebase expected to comply with any specific EIPs?
nuMoney synthetics are ERC20
___

### Q: Are there any off-chain mechanisms involved in the protocol (e.g., keeper bots, arbitrage bots, etc.)? We assume these mechanisms will not misbehave, delay, or go offline unless otherwise specified.
We will rely on liquidation bots for the lending protocol (compound fork). Liquidation bots will rely on lending protocol emitted events.
Arbitrage bots are important for understanding our protocol, but they are third-party and not technically part of our protocol. 
___

### Q: What properties/invariants do you want to hold even if breaking them has a low/unknown impact?
These might apply:
Vault dollar value should always exceed dollar value of outstanding synthetics
Protocol cannot lend when CF_liquid < 20%, where CF_liquid = rETH_vault / synthetic_rETHdebt. 
New synthetics cannot be minted when CFTHEORETICAL < 110%, where CFTHEORETICAL = rETH_accountingBalance / synthetic_rETHdebt.
___

### Q: Please discuss any design choices you made.
N/A
___

### Q: Please provide links to previous audits (if any).
Tapir did our first audit and review (https://audits.sherlock.xyz/watson/mstpr-brainbot). He’s away right now, so he hasn’t been able to update the reports given. However, our developer, Thibaud, created a review doc that accounts for this. 

Here is Tapir’s original report:
https://hackmd.io/@tapir/ry1TenmY0

Then, Thibaud made the appropriate fixes and produced the following doc. If something is marked fixed in this doc, then it has been. Anything that was marked dispute has been ignored as not an issue.
https://www.notion.so/AUDIT-REVIEW-7b41bca6c9694c24ba661f1c428d2381

Then, Tapir reviewed the fixes, along with some code changes we wanted him to review. The new changes were the buy fee PID and the leverage strategies. Tapir approved all the previous fixes and produced this report.
https://hackmd.io/K18r2JI3SzGrVwpK1mgBEA

Thibaud made the fixes from this report, too.
___

### Q: Please list any relevant protocol resources.
Here’s a link to a doc with our answers to all these context questions, since the formatting is easier to read: https://docs.google.com/document/d/1iZh7PXoSvdEws36EU61EDuhJPFLFxEbOqsFIijAL6WI/edit?usp=sharing

Two decks with general background on the protocol:
https://docs.google.com/presentation/d/1Hf_zskMHjUxKmXabYi0ehQ9TDSxSVoP8km9UETIYjLI/edit?usp=sharing
https://docs.google.com/presentation/d/1pMuElk1q1D_u7mdHH-vj7hTwDNaElOkApDDh-Qj2ulo/edit?usp=sharing

Website:
https://numa.money/

Whitepaper has the most important details:
https://numa-1.gitbook.io/numa-v3-white-paper

There is quite a bit of explanation on our X, as well.
___

### Q: Additional audit information.
We forked Compound v2, Offshift’s synthetics printer, and Jaypeggerz vault. There have been many modifications, though. 
Following contracts only have minor changes to the original Compound v2 contract

- CERC20
- CERC20Immutable
- CToken
- CTokenInterface 
- ComptrollerStorage
- ErrorReporter
- Exponential 
- ExponentialNoError
- JumprateModelV4
- SafeMath
- Unitroller
- Lens/CompoundLens

- NumaComportoller is a fork of Comptroller but has multiple changes
___



# Audit scope


[Numa @ c6476d828f556967e64410b5c11c1f2cd77220c7](https://github.com/NumaMoney/Numa/tree/c6476d828f556967e64410b5c11c1f2cd77220c7)
- [Numa/contracts/Numa.sol](Numa/contracts/Numa.sol)
- [Numa/contracts/NumaProtocol/NumaMinter.sol](Numa/contracts/NumaProtocol/NumaMinter.sol)
- [Numa/contracts/NumaProtocol/NumaOracle.sol](Numa/contracts/NumaProtocol/NumaOracle.sol)
- [Numa/contracts/NumaProtocol/NumaPrinter.sol](Numa/contracts/NumaProtocol/NumaPrinter.sol)
- [Numa/contracts/NumaProtocol/NumaVault.sol](Numa/contracts/NumaProtocol/NumaVault.sol)
- [Numa/contracts/NumaProtocol/USDCToEthConverter.sol](Numa/contracts/NumaProtocol/USDCToEthConverter.sol)
- [Numa/contracts/NumaProtocol/VaultManager.sol](Numa/contracts/NumaProtocol/VaultManager.sol)
- [Numa/contracts/NumaProtocol/VaultOracleSingle.sol](Numa/contracts/NumaProtocol/VaultOracleSingle.sol)
- [Numa/contracts/lending/CErc20.sol](Numa/contracts/lending/CErc20.sol)
- [Numa/contracts/lending/CErc20Immutable.sol](Numa/contracts/lending/CErc20Immutable.sol)
- [Numa/contracts/lending/CNumaLst.sol](Numa/contracts/lending/CNumaLst.sol)
- [Numa/contracts/lending/CNumaToken.sol](Numa/contracts/lending/CNumaToken.sol)
- [Numa/contracts/lending/CToken.sol](Numa/contracts/lending/CToken.sol)
- [Numa/contracts/lending/CarefulMath.sol](Numa/contracts/lending/CarefulMath.sol)
- [Numa/contracts/lending/ComptrollerStorage.sol](Numa/contracts/lending/ComptrollerStorage.sol)
- [Numa/contracts/lending/ErrorReporter.sol](Numa/contracts/lending/ErrorReporter.sol)
- [Numa/contracts/lending/Exponential.sol](Numa/contracts/lending/Exponential.sol)
- [Numa/contracts/lending/ExponentialNoError.sol](Numa/contracts/lending/ExponentialNoError.sol)
- [Numa/contracts/lending/InterestRateModel.sol](Numa/contracts/lending/InterestRateModel.sol)
- [Numa/contracts/lending/JumpRateModelV4.sol](Numa/contracts/lending/JumpRateModelV4.sol)
- [Numa/contracts/lending/JumpRateModelVariable.sol](Numa/contracts/lending/JumpRateModelVariable.sol)
- [Numa/contracts/lending/Lens/CompoundLens.sol](Numa/contracts/lending/Lens/CompoundLens.sol)
- [Numa/contracts/lending/NumaComptroller.sol](Numa/contracts/lending/NumaComptroller.sol)
- [Numa/contracts/lending/NumaLeverageVaultSwap.sol](Numa/contracts/lending/NumaLeverageVaultSwap.sol)
- [Numa/contracts/lending/NumaPriceOracleNew.sol](Numa/contracts/lending/NumaPriceOracleNew.sol)
- [Numa/contracts/lending/PriceOracleCollateralBorrow.sol](Numa/contracts/lending/PriceOracleCollateralBorrow.sol)
- [Numa/contracts/lending/SafeMath.sol](Numa/contracts/lending/SafeMath.sol)
- [Numa/contracts/lending/Unitroller.sol](Numa/contracts/lending/Unitroller.sol)
- [Numa/contracts/libraries/OracleUtils.sol](Numa/contracts/libraries/OracleUtils.sol)
- [Numa/contracts/nuAssets/nuAsset2.sol](Numa/contracts/nuAssets/nuAsset2.sol)
- [Numa/contracts/nuAssets/nuAssetManager.sol](Numa/contracts/nuAssets/nuAssetManager.sol)
- [Numa/contracts/utils/constants.sol](Numa/contracts/utils/constants.sol)

