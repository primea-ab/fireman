package main

import (
	"crypto/sha1"
	"encoding/base64"
	"net/http"
	"log"
	"io"
	"encoding/json"
	"bufio"
)


func main() {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request){
		log.Printf("Headers %v", r.Header)
		encoded, _ := r.Header["Sec-Websocket-Key"]
		log.Printf("%v", encoded)
		magicString := encoded[0] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
		h := sha1.New()
		io.WriteString(h, magicString)
		acceptH := base64.StdEncoding.EncodeToString(h.Sum(nil))
		log.Printf("Accept header %v", acceptH)
		

		hj, ok := w.(http.Hijacker)
		if !ok {
			http.Error(w, "webserver doesn't support hijacking", http.StatusInternalServerError)
			return 
		}
		conn, bufrw, err := hj.Hijack()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		
		defer conn.Close()
		bufrw.WriteString("HTTP/1.1 101  Switching Procotcols\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Accept: " + acceptH + "\n\n")
		bufrw.Flush()

		// Now the websockts is set up.
		// Starting a read loop

		for {
			// log.Printf("Reading")
			// Ignoring first byte 
			_, _ = bufrw.ReadByte()
			// Reading length of data
			l, _ := bufrw.ReadByte()
			if err != nil {
				log.Printf("error reading")
				return
			}
			msgLen := l & 0x7F
			//log.Printf("L %v", msgLen)
			b := make([]byte, 150)
			_,_ = bufrw.Read(b)
			// First 4 bytes are the mask
			mask := b[0:4]
			// Read data with length after mask
			maskedMsg := b[4:4+msgLen]

			// Unmask data
			msg := make([]byte, msgLen)
			for i := 0; i < int(msgLen); i++ {
				msg[i] = maskedMsg[i] ^ mask[i % 4]
			}

			var message Message
			_ = json.Unmarshal(msg, &message)
			log.Printf("Read bytes %v", message)

			data, _ := json.Marshal(message)

			WriteToSocket(bufrw, data)

		}
	})
	log.Fatal(http.ListenAndServe(":8000", nil))
}


func WriteToSocket(w *bufio.ReadWriter, msg []byte) error {
	err := w.WriteByte(0x81)
	if err != nil {
		return err
	}
	msgLen := byte(len(msg))
	err = w.WriteByte(msgLen)
	_, err = w.Write(msg)
	if err != nil {
		return err
	}
	return w.Flush()
}

type Message struct {
	Id string 
	X int32 
	Y int32
}