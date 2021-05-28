package main

import (
	"crypto/sha1"
	"encoding/base64"
	"net/http"
	"log"
	"io"
	"io/ioutil"
	"encoding/json"
	"bufio"
	"./game"
)


func main() {

	var g = game.NewGame()

	http.HandleFunc("/", func(w http.ResponseWriter, r*http.Request) {
		body, _ := ioutil.ReadFile("index.html")
		w.Header().Set("Content-Type", "text/html")
		w.Write(body)
	})
	http.HandleFunc("/canvas.js", func(w http.ResponseWriter, r *http.Request) {
		body, _ := ioutil.ReadFile("canvas.js")
		w.Header().Set("Content-Type", "application/javascript")
		w.Write(body)
	})
	http.HandleFunc("/cave_B.png", func(w http.ResponseWriter, r *http.Request) {
		body, _ := ioutil.ReadFile("cave_B.png")
		w.Header().Set("Content-Type", "image/webbp")
		w.Write(body)
	})
	http.HandleFunc("/start", func(w http.ResponseWriter, r *http.Request) {
		go g.Play()
		w.WriteHeader(http.StatusNoContent)
	})





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

		player := &game.Player{InGame: false, Id: ""}
		outChan := make(chan game.Message)
		player.OutChan = outChan
		go func(w *bufio.ReadWriter){
			for {
				outMsg := <- outChan
				data, _ := json.Marshal(outMsg)
				WriteToSocket(w, data)
			}
		}(bufrw)



		// Now the websockts is set up.
		// Starting a read loop


		

		for {
			// log.Printf("Reading")
			b1, _ := bufrw.ReadByte()
			if (b1 == 0x0) {
				continue
			}
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

			log.Printf("Read bytes %s", msg)
			var message game.Message
			_ = json.Unmarshal(msg, &message)

			// Add player
			if player.InGame {
				g.InputChan <- message
			} else {
				player.Id = message.Id
				g.AddPlayer(player)
			}

	
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

