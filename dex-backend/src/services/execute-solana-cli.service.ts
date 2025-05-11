import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class ExecuteSolanaCliService {

    ALMPubKey = 'pFV11axxRCogW3nPGchmV6YbK4EpgQGFZrSyk1KZFEL';

    async changeConfig(keypair: string): Promise<{ commitment: string }> {
        try {
            // Determine the keypair path based on the input parameter
            let keypairPath: string;
            if (keypair === 'AMM') {
                keypairPath = '~/.config/solana/alm.json';
            } else if (keypair === 'USER') {
                keypairPath = '~/.config/solana/user.json';
            } else {
                throw new Error('Invalid keypair specified. Use "AMM" or "user".');
            }
            
            // Execute the Solana config set command
            const cmd = `solana config set -k ${keypairPath}`;
            const { output } = await this.runChangeSolanaConfig(cmd);
            
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
        userWalletPubKey: string
    ): Promise<{ inputSignature: string; outputSignature: string }> {
        await this.changeConfig('USER');

        const cmdGetALMATA = `spl-token address --verbose --owner ${this.ALMPubKey} --token ${tokenInMintAddress}`;
        const almATA = (await this.runAssociatedAccountCommand(cmdGetALMATA)).associatedTokenAddress;

        const cmdTransferUserToAMM = `spl-token transfer ${tokenInMintAddress} ${tokenInAmount} ${almATA} --confidential`;
        const signatureInput = (await this.runConfidentialTransferCommand(cmdTransferUserToAMM)).signature;
        console.log(`Input Signature: ${signatureInput}`);

        await this.changeConfig('AMM');

        const cmdGetUSERATA = `spl-token address --verbose --owner ${userWalletPubKey} --token ${tokenOutMintAddress}`;
        const userATA = (await this.runAssociatedAccountCommand(cmdGetUSERATA)).associatedTokenAddress;

        const cmdTransferAMMToUser = `spl-token transfer ${tokenOutMintAddress} ${tokenOutAmount} ${userATA} --confidential`;
        const signatureOutput = (await this.runConfidentialTransferCommand(cmdTransferAMMToUser)).signature;
        console.log(`Output Signature: ${signatureOutput}`);

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
        await this.changeConfig('USER');

        const cmdGetTokenAAccount = `spl-token address --verbose --owner ${this.ALMPubKey} --token ${tokenAMintAddress}`;
        const tokenAATA = (await this.runAssociatedAccountCommand(cmdGetTokenAAccount)).associatedTokenAddress;
        const cmdTransferTokenAUserToAMM = `spl-token transfer ${tokenAMintAddress} ${tokenAAmount} ${tokenAATA} --confidential`;
        const signatureTokenATransfer = (await this.runConfidentialTransferCommand(cmdTransferTokenAUserToAMM)).signature;
        console.log(`TokenA Signature: ${signatureTokenATransfer}`);

        const cmdGetTokenBAccount = `spl-token address --verbose --owner ${this.ALMPubKey} --token ${tokenBMintAddress}`;
        const tokenBATA = (await this.runAssociatedAccountCommand(cmdGetTokenBAccount)).associatedTokenAddress;
        const cmdTransferTokenBUserToAMM = `spl-token transfer ${tokenBMintAddress} ${tokenBAmount} ${tokenBATA} --confidential`;
        const signatureTokenBTransfer = (await this.runConfidentialTransferCommand(cmdTransferTokenBUserToAMM)).signature;
        console.log(`TokenAB Signature: ${signatureTokenBTransfer}`);


        return {
            signatureTokenATransfer: signatureTokenATransfer ?? (() => { throw new Error('Input signature is undefined'); })(),
            signatureTokenBTransfer: signatureTokenBTransfer ?? (() => { throw new Error('Input signature is undefined'); })()
        };
    }


    async runConfidentialTransferCommand(command: string): Promise<{ output: string; signature?: string }> {
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

    async runAssociatedAccountCommand(command: string): Promise<{ associatedTokenAddress?: string }> {
        try {
            console.log(`Executing command: ${command}`);
            const { stdout, stderr } = await execPromise(command);
            let associatedTokenAddress: string | undefined;

            if (stdout) {                
                // Extract the associated token address using regex
                const ataMatch = stdout.match(/Associated token address:\s+([^\s]+)/);
                if (ataMatch && ataMatch[1]) {
                    console.log(`Associated Token Address: ${ataMatch[1]}`);
                    associatedTokenAddress = ataMatch[1];
                }
            }
            
            if (stderr) {
                console.log(`Get Associated Token Address Error:`);
                console.log(`${stderr}`);
                throw new Error(`Failed to execute command: ${stderr}`);
            }
            
            return { associatedTokenAddress };
        } catch (error) {
            throw new Error(`Failed to get associated token address: ${error.message}`);
        }
    }

    async runChangeSolanaConfig(command: string): Promise<{ output: string }> {
        try {
            console.log(`Executing command: ${command}`);
            const { stdout, stderr } = await execPromise(command);
            if (stderr) {
                console.log(`Change Solana Config Error :`);
                console.log(`${stderr}`);
                throw new Error(`Failed to execute command: ${stderr}`);
            }
            return { output: stdout };
        } catch (error) {
            throw new Error(`Failed to execute command: ${error.message}`);
        }
    }

}