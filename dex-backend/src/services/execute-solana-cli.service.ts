import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class ExecuteSolanaCliService {

    async runCommand(command: string): Promise<{ output: string; signature?: string }> {
        try {
            console.log(`Executing command: ${command}`);
            const { stdout, stderr } = await execPromise(command);
            let signature: string | undefined;
            
            if (stdout) {                
                // Extract the signature using regex
                const signatureMatch = stdout.match(/Signature:\s+([^\s]+)/);
                if (signatureMatch && signatureMatch[1]) {
                    signature = signatureMatch[1];
                }
            }
            
            if (stderr) {
                console.log(`Transfer Error :`);
                console.log(`${stderr}`);
                throw new Error(`Failed to execute command: ${stderr}`);
            }
            
            return { output: stdout, signature };
        } catch (error) {
            throw new Error(`Failed to execute command: ${error.message}`);
        }
    }

    async changeConfig(keypair: string): Promise<{ commitment: string }> {
        try {
            // Determine the keypair path based on the input parameter
            let keypairPath: string;
            if (keypair === 'AMM') {
                keypairPath = '~/.config/solana/id.json';
            } else if (keypair === 'USER') {
                keypairPath = '~/.config/solana/id2.json';
            } else {
                throw new Error('Invalid keypair specified. Use "AMM" or "user".');
            }
            
            // Execute the Solana config set command
            const cmd = `solana config set -k ${keypairPath}`;
            const { output } = await this.runCommand(cmd);
            
            // Extract the commitment value from the output
            const commitmentMatch = output.match(/Commitment:\s+([^\s]+)/);
            const commitment = commitmentMatch && commitmentMatch[1] ? commitmentMatch[1] : 'unknown';
            
            console.log(`Changed Solana config to use keypair: ${keypair}, commitment: ${commitment}`);
            
            return { commitment };
        } catch (error) {
            throw new Error(`Failed to change Solana config: ${error.message}`);
        }
    }

    async executeSwap(
        tokenInMintAddress: string,
        tokenOutMintAddress: string,
        tokenInAmount: number,
        tokenOutAmount: number,
        userTokenOutAccount: string
    ): Promise<{ inputSignature: string; outputSignature: string }> {

        const ammATA = 'JDDVxTCWfz7SJUVoW26wNXR7BbVPrP2TCG37nxFzv3xa'; // Replace with actual AMM ATA

        await this.changeConfig('USER');
        const cmdTransferUserToAMM = `spl-token transfer ${tokenInMintAddress} ${tokenInAmount} ${ammATA} --confidential`;
        const signatureInput = (await this.runCommand(cmdTransferUserToAMM)).signature;

        await this.changeConfig('AMM');
        const cmdTransferAMMToUser = `spl-token transfer ${tokenOutMintAddress} ${tokenOutAmount} ${userTokenOutAccount} --confidential`;
        const signatureOutput = (await this.runCommand(cmdTransferAMMToUser)).signature;

        return {
            inputSignature: signatureInput ?? (() => { throw new Error('Input signature is undefined'); })(),
            outputSignature: signatureOutput ?? (() => { throw new Error('Input signature is undefined'); })()
        };
    }

    async executeDeposit(
        tokenAMintAddress: string,
        tokenBMintAddress: string,
        tokenAAmount: number,
        tokenBAmount: number
    ): Promise<{ signatureTokenATransfer: string; signatureTokenBTransfer: string }>  {
        const cmdTransferTokenAUserToAMM = `spl-token transfer ${tokenAMintAddress} ${tokenAAmount} <LP ATA> --confidential`;
        const signatureTokenATransfer = (await this.runCommand(cmdTransferTokenAUserToAMM)).signature;

        const cmdTransferTokenBUserToAMM = `spl-token transfer ${tokenBMintAddress} ${tokenBAmount} <LP ATA> --confidential`;
        const signatureTokenBTransfer = (await this.runCommand(cmdTransferTokenBUserToAMM)).signature;

        return {
            signatureTokenATransfer: signatureTokenATransfer ?? (() => { throw new Error('Input signature is undefined'); })(),
            signatureTokenBTransfer: signatureTokenBTransfer ?? (() => { throw new Error('Input signature is undefined'); })()
        };
    }

}