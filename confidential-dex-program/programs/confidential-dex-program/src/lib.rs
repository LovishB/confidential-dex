use anchor_lang::prelude::*;

// Use your actual program ID here
declare_id!("Ez9BYqZrJqo1TCqHKfAzWUBZpabrCLMvpe9fEV7BxhJP"); // Replace with your real program ID

// Define the structure of the pool for each token pair
#[account]
pub struct Pool {
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub token_a_amount: u64,
    pub token_b_amount: u64,
}

// Define the program's instructions
#[program]
pub mod multi_pool_amm {
    use super::*;

    // Create a new liquidity pool
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        token_a_mint: Pubkey,
        token_b_mint: Pubkey
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        pool.token_a_mint = token_a_mint;
        pool.token_b_mint = token_b_mint;
        pool.token_a_amount = 0;
        pool.token_b_amount = 0;

        Ok(())
    }

    // Deposit liquidity into a token pair pool
    pub fn deposit_liquidity(
        ctx: Context<DepositLiquidity>, 
        token_a_amount: u64, 
        token_b_amount: u64
    ) -> Result<()> {
        require!(token_a_amount > 0 && token_b_amount > 0, ErrorCode::InvalidAmount);

        // Get the pool for the token pair
        let pool = &mut ctx.accounts.pool;

        // Update the pool balances by adding the deposited liquidity
        pool.token_a_amount += token_a_amount;
        pool.token_b_amount += token_b_amount;

        Ok(())
    }

    // Swap Token A for Token B based on the pool's liquidity
    pub fn swap(
        ctx: Context<Swap>, 
        token_a_amount: u64
    ) -> Result<()> {
        require!(token_a_amount > 0, ErrorCode::InvalidAmount);

        // Get the pool for the token pair
        let pool = &mut ctx.accounts.pool;

        // Calculate how much Token B the user will receive using the AMM formula
        let token_b_amount = get_quote(pool, token_a_amount);

        // Ensure the pool has enough liquidity for the swap
        require!(pool.token_b_amount >= token_b_amount, ErrorCode::InsufficientLiquidity);

        // Update the pool balances after the swap
        pool.token_a_amount += token_a_amount;
        pool.token_b_amount -= token_b_amount;

        Ok(())
    }

    // Get the current pool size for a specific token pair
    pub fn get_pool_size(ctx: Context<GetPoolSize>) -> Result<(u64, u64)> {
        let pool = &ctx.accounts.pool;
        Ok((pool.token_a_amount, pool.token_b_amount))
    }
}

// Move helper functions OUTSIDE the #[program] mod
pub fn get_quote(pool: &Pool, token_a_amount: u64) -> u64 {
    if pool.token_a_amount == 0 || pool.token_b_amount == 0 {
        return 0;
    }

    // Deduct fee from Token A 0.3% fee (997/1000)
    let token_a_with_fee = token_a_amount * 997;

    // AMM constant product formula: k = x * y
    let numerator = token_a_with_fee * pool.token_b_amount;
    let denominator = pool.token_a_amount * 1000 + token_a_with_fee;

    numerator / denominator
}

// Define the context for the liquidity creation instruction
#[derive(Accounts)]
#[instruction(token_a_mint: Pubkey, token_b_mint: Pubkey)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 8 + 8,
        seeds = [b"pool", token_a_mint.as_ref(), token_b_mint.as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Define the context for the deposit liquidity instruction
#[derive(Accounts)]
pub struct DepositLiquidity<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>,
}

// Define the context for the swap instruction
#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)] 
    pub pool: Account<'info, Pool>,
    #[account(mut)] 
    pub user: Signer<'info>,
}

// Define the context for getting the pool size
#[derive(Accounts)]
pub struct GetPoolSize<'info> {
    pub pool: Account<'info, Pool>,
}

// Define error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount. The amount must be greater than zero.")]
    InvalidAmount,
    #[msg("Insufficient liquidity in the pool.")]
    InsufficientLiquidity,
}
