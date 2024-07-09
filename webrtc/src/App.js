import React, { useRef, useEffect, useState } from 'react';
import './App.css';

const App = () => {
  // 비디오 요소에 접근하기 위한 ref 생성
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // 피어 연결 상태를 관리하기 위한 state
  const [pc, setPc] = useState(null);

  // WebSocket 연결을 관리하기 위한 ref
  const socket = useRef(null);

  useEffect(() => {
    // 피어 연결 생성 함수
    const createPeerConnection = () => {
      const peerConnection = new RTCPeerConnection();

      // ICE 후보가 발견되었을 때 호출되는 콜백
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          console.log('Sending candidate:', event.candidate);
          // ICE 후보를 WebSocket을 통해 상대 피어에게 전송
          socket.current.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
      };

      // 원격 스트림을 수신했을 때 호출되는 콜백
      peerConnection.ontrack = event => {
        if (remoteVideoRef.current) {
          console.log('Receiving remote stream:', event.streams[0]);
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      return peerConnection;
    };

    // 피어 연결 생성 및 상태 업데이트
    const peerConnection = createPeerConnection();
    setPc(peerConnection);

    // WebSocket 연결 설정
    socket.current = new WebSocket('ws://localhost:8080');

    // WebSocket을 통해 수신한 메시지를 처리하는 함수
    socket.current.onmessage = async (message) => {
      // const data = JSON.parse(message.data);
      // console.log('Received message:', data);
      if (message.data instanceof Blob) {
        // Blob 데이터를 처리하기 위한 FileReader 사용
        const reader = new FileReader();
        reader.onload = async () => {
          const data = JSON.parse(reader.result);
          console.log('Received message:', data);
          if (data.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.current.send(JSON.stringify({ type: 'answer', answer }));
          } else if (data.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          } else if (data.type === 'candidate') {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        };
        reader.readAsText(message.data);
      } else {
        // Blob이 아닌 다른 형식의 데이터 처리
        const data = JSON.parse(message.data);
        console.log('Received message:', data);
        if (data.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.current.send(JSON.stringify({ type: 'answer', answer }));
        } else if (data.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === 'candidate') {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      }
    };

    // 컴포넌트 언마운트 시 연결 정리
    return () => {
      peerConnection.close();
      socket.current.close();
    };
  }, []);

  // 화면 공유 시작 함수
  const startScreenShare = async () => {
    try {
      // 사용자의 화면을 캡처
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 스트림의 각 트랙을 피어 연결에 추가
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // offer 생성 및 로컬 설명 설정
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // offer를 WebSocket을 통해 상대 피어에게 전송
      socket.current.send(JSON.stringify({ type: 'offer', offer }));
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  return (
      <div>
        <h1>Screen Sharing with WebRTC</h1>
        <button onClick={startScreenShare}>Share Screen</button>
        <div>
          <h2>Local Screen</h2>
          <video ref={localVideoRef} autoPlay playsInline></video>
        </div>
        <div>
          <h2>Remote Screen</h2>
          <video ref={remoteVideoRef} autoPlay playsInline></video>
        </div>
      </div>
  );
};

export default App;
