# engagespot-node

NodeJS SDK for https://engagespot.co/  

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

```typescript
import { Engagespot } from 'engagespot-node';

const client = new Engagespot('API_KEY', 'API_SECRET');

client
    .createNotification('Hello world!')
    .setMessage('So long!')
    .setIcon('https://example.com/icon.svg')
    .setUrl('https://example.com')
    .setCategory('welcome')
    .addRecipient('world@example.com')
    .send();

```