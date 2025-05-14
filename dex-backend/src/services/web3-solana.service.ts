import { Connection, PublicKey, Keypair, ConfirmOptions } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import * as fs from 'fs';

export class Web3SolanaService {
  private connection: Connection;
  private provider: anchor.AnchorProvider;
  private keypair: Keypair;
  private programId: PublicKey;

  constructor() {
    const rpcUrl = 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    const secretKeyBase58 = '2Lj4pN9wTRyr729x3H5B2FNuzhTh9njbDaNqjHoSzQaCrSy4GVpRakq2cpPfukf9TpdqE3SnAdk1hvXNm81VfaWx';
    this.keypair = Keypair.fromSecretKey(bs58.decode(secretKeyBase58));
    const wallet = new anchor.Wallet(this.keypair);
    const opts: ConfirmOptions = {
      skipPreflight: false,
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    };
    this.provider = new anchor.AnchorProvider(this.connection, wallet, opts);
    anchor.setProvider(this.provider);
    this.programId = new PublicKey('Ez9BYqZrJqo1TCqHKfAzWUBZpabrCLMvpe9fEV7BxhJP');
  }

  // Example: Get account balance
  async getBalance(publicKey: string): Promise<number> {
    const key = new PublicKey(publicKey);
    return await this.connection.getBalance(key);
  }

  /**
   * Calls the initialize_pool instruction on the Anchor program.
   * @param programId The program ID of your deployed Anchor program.
   * @param tokenAMint The mint address of token A.
   * @param tokenBMint The mint address of token B.
   * @param userKeypair The Keypair of the user initializing the pool.
   */
  async initializePool(
    tokenAMint: string,
    tokenBMint: string
  ): Promise<string> {
    try {
    const idl = JSON.parse(fs.readFileSync('./src/idl/multi_pool_amm.json', 'utf8'));
    if (!idl) {
        throw new Error("Failed to fetch IDL for the program.");
    }
    const program = new anchor.Program(idl, this.provider);

    const tokenAMintPk = new PublicKey(tokenAMint);
    const tokenBMintPk = new PublicKey(tokenBMint);

    const [poolPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), tokenAMintPk.toBuffer(), tokenBMintPk.toBuffer()],
      this.programId
    );

    // Build the transaction
    const tx = await program.methods
      .initializePool(
        new PublicKey(tokenAMint),
        new PublicKey(tokenBMint)
      )
      .accounts({
        pool: poolPda,
        user: this.keypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        program: this.programId
      })
      .signers([this.keypair])
      .rpc();

    return tx; // Returns the transaction signature
    } catch (error) {
      console.error("Error initializing pool:", error);
      throw new Error("Failed to initialize pool");
    }
  }

  async getPoolSize(tokenAMint: string, tokenBMint: string): Promise<any> {
    try {
      const idl = JSON.parse(fs.readFileSync('./src/idl/multi_pool_amm.json', 'utf8'));
      if (!idl) {
        throw new Error("Failed to fetch IDL for the program.");
      }
      const program = new anchor.Program(idl, this.provider);

      const tokenAMintPk = new PublicKey(tokenAMint);
      const tokenBMintPk = new PublicKey(tokenBMint);

      const [poolPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from('pool'), tokenAMintPk.toBuffer(), tokenBMintPk.toBuffer()],
        this.programId
      );

      const poolAccount = await program.account["pool"].fetch(poolPda);

      return {
        tokenAAmount: Number(poolAccount.tokenAAmount),
        tokenBAmount: Number(poolAccount.tokenBAmount)
      };
    } catch (error) {
      console.error("Error fetching pool size:", error);
      throw new Error("Failed to fetch pool size");
    }
  }

  async depositLiquidity(
    tokenAMint: string,
    tokenBMint: string,
    tokenAAmount: number,
    tokenBAmount: number
  ): Promise<string> {
    try {
      const idl = JSON.parse(fs.readFileSync('./src/idl/multi_pool_amm.json', 'utf8'));
      if (!idl) {
        throw new Error("Failed to fetch IDL for the program.");
      }
      const program = new anchor.Program(idl, this.provider);

      const tokenAMintPk = new PublicKey(tokenAMint);
      const tokenBMintPk = new PublicKey(tokenBMint);

      const [poolPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from('pool'), tokenAMintPk.toBuffer(), tokenBMintPk.toBuffer()],
        this.programId
      );

      // Convert amounts to BN (Big Number) as expected by Anchor
      const tokenAAmountBN = new anchor.BN(tokenAAmount);
      const tokenBAmountBN = new anchor.BN(tokenBAmount);

      // Build the transaction
      const tx = await program.methods
        .depositLiquidity(
          tokenAAmountBN, 
          tokenBAmountBN
        )
        .accounts({
          pool: poolPda,
          user: this.keypair.publicKey,
        })
        .signers([this.keypair])
        .rpc();

      return tx; // Returns the transaction signature
    } catch (error) {
      console.error("Error depositing liquidity:", error);
      throw new Error("Failed to deposit liquidity");
    }
  }

  async swap(
    tokenAMint: string,
    tokenBMint: string,
    tokenAAmount: number
  ): Promise<string> {
    try {
      const idl = JSON.parse(fs.readFileSync('./src/idl/multi_pool_amm.json', 'utf8'));
      if (!idl) {
        throw new Error("Failed to fetch IDL for the program.");
      }
      const program = new anchor.Program(idl, this.provider);

      const tokenAMintPk = new PublicKey(tokenAMint);
      const tokenBMintPk = new PublicKey(tokenBMint);

      const [poolPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from('pool'), tokenAMintPk.toBuffer(), tokenBMintPk.toBuffer()],
        this.programId
      );

      // Convert amount to BN (Big Number) as expected by Anchor
      const tokenAAmountBN = new anchor.BN(tokenAAmount);

      // Build the transaction
      const tx = await program.methods
        .swap(tokenAAmountBN)
        .accounts({
          pool: poolPda,
          user: this.keypair.publicKey,
        })
        .signers([this.keypair])
        .rpc();

      return tx; // Returns the transaction signature
    } catch (error) {
      console.error("Error executing swap:", error);
      throw new Error("Failed to execute swap");
    }
  }
}