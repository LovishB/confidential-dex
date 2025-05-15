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
    try {
      const rpcUrl = 'https://solana-devnet.g.alchemy.com/v2/KfeSu5q27FaoFJqNzanj3VemrijlRuUM';
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
    } catch (error) {
      console.error("Error initializing Web3SolanaService:", error);
    }
  }

  // Example: Get account balance
  async getBalance(publicKey: string): Promise<number> {
    try {
      const key = new PublicKey(publicKey);
      return await this.connection.getBalance(key);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw new Error("Failed to get balance");
    }
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

      const tx = await program.methods
        .depositLiquidity(
          tokenAAmountBN, 
          tokenBAmountBN
        )
        .accounts({
          pool: poolPda,
          user: this.keypair.publicKey,
        })
        .transaction();

      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = this.keypair.publicKey;
      
      tx.sign(this.keypair);

      const rawTx = tx.serialize();
      const txSig = await this.connection.sendRawTransaction(rawTx, {
        skipPreflight: false,
      });

      // Confirm using polling
      await this.confirmTransaction(txSig);

      return txSig; // Returns the transaction signature
    } catch (error) {
      console.error("Error depositing liquidity:", error);
      throw new Error("Failed to deposit liquidity");
    }
  }

  async swapLiquidity(
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

      const tx = await program.methods
      .swap(tokenAAmountBN)
      .accounts({
        pool: poolPda,
        user: this.keypair.publicKey,
      })
      .transaction();

      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = this.keypair.publicKey;
      
      tx.sign(this.keypair);

      const rawTx = tx.serialize();
      const txSig = await this.connection.sendRawTransaction(rawTx, {
        skipPreflight: false,
      });

      // Confirm using polling
      await this.confirmTransaction(txSig);

      return txSig; // Returns the transaction signature
    } catch (error) {
      console.error("Error executing swap:", error);
      throw new Error("Failed to execute swap");
    }
  }

  private async confirmTransaction(signature: string): Promise<void> {
    try {
      let retries = 10;
      while (retries > 0) {
        try {
          const result = await this.connection.getSignatureStatus(signature);
          if (result.value?.confirmationStatus === 'confirmed' || 
              result.value?.confirmationStatus === 'finalized') {
            return;
          }
        } catch (e) {
          console.log('Error confirming transaction:', e);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      }
      throw new Error('Transaction confirmation timed out');
    } catch (error) {
      console.error("Error in confirmTransaction:", error);
      throw new Error("Failed to confirm transaction");
    }
  }
}