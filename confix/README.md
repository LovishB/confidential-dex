# ConfiX

ConfiX is a decentralized exchange (DEX) application that allows users to swap tokens and provide liquidity in a confidential manner. The application leverages zero-knowledge proofs to ensure privacy while maintaining on-chain verifiability.

## Features

- **Token Swapping**: Users can easily swap between different tokens with a user-friendly interface.
- **Liquidity Pools**: Users can provide liquidity to various token pairs and earn rewards.
- **Confidential Transactions**: All transactions are encrypted using zk-proofs to ensure user privacy.

## Project Structure

```
confix
├── src
│   ├── app
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.module.ts
│   │   ├── components
│   │   │   ├── home
│   │   │   │   ├── home.component.ts
│   │   │   │   ├── home.component.html
│   │   │   │   └── home.component.scss
│   │   │   ├── swap
│   │   │   │   ├── swap.component.ts
│   │   │   │   ├── swap.component.html
│   │   │   │   └── swap.component.scss
│   │   │   └── pools
│   │   │       ├── pools.component.ts
│   │   │       ├── pools.component.html
│   │   │       └── pools.component.scss
│   │   ├── services
│   │   │   └── swap.service.ts
│   │   └── models
│   │       └── pool.model.ts
│   ├── assets
│   │   └── images
│   ├── environments
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

To get started with the ConfiX application, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd confix
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.