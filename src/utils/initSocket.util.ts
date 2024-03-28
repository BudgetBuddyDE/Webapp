import { io } from 'socket.io-client';
import { type IAuthContext } from '@/components/Auth';

export function getSocketIOClient(authOptions: IAuthContext['authOptions']) {
  return io(
    `${process.env.NODE_ENV === 'production' ? 'wss' : 'ws'}://${
      process.env.STOCK_SERVICE_HOST!.split('//')[1]
    }`,
    {
      autoConnect: false,
      auth: {
        token: `Bearer ${authOptions.uuid}.${authOptions.password}`,
      },
    }
  );
}
