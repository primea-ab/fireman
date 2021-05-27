package main

import (
	"crypto/sha1"
	"encoding/base64"
	"net/http"
	"log"
	"io"
	"strings"
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


		log.Printf("Reading")
		_, _ = bufrw.ReadByte()
		l, _ := bufrw.ReadByte()
		if err != nil {
			log.Printf("error reading")
			return
		}
		msgLen := l & 0x7F
		log.Printf("L %v", msgLen)
		b := make([]byte, 100)
		_,_ = bufrw.Read(b)
		mask := b[0:4]
		maskedMsg := b[4:4+msgLen]

		msg := make([]byte, msgLen)
		for i := 0; i < int(msgLen); i++ {
			msg[i] = maskedMsg[i] ^ mask[i % 4]
		}
		
		var builder strings.Builder
		builder.Write(msg)
		s := builder.String()
		log.Printf("Read bytes %#v", s)


		err = bufrw.WriteByte(0x81)
		if err != nil {
			log.Printf("Failed to write %v", err)
		}
		err = bufrw.WriteByte(0x05)
		if err != nil {
			log.Printf("Failed to write %v", err)
		}
		nn, err := bufrw.WriteString("hEllo")
		if err != nil {
			log.Printf("Failed to write %v", err)
		}
		log.Printf("Wrote %v to buffer", nn)
		err = bufrw.Flush()
		if err != nil {
			log.Printf("Failed to flush %v", err)
		}
		log.Printf("Flushed")
		bufrw.ReadByte()
	})
	log.Fatal(http.ListenAndServe(":8000", nil))
}