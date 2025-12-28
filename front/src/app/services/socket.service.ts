// src/app/services/socket.service.ts

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      withCredentials: false
    });
  }

  // Listen for dashboard update
  onDashboardUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('dashboardUpdated', (data) => {
        observer.next(data);
      });
    });
  }
}


//update corresponding ts