package game 

import (
	"log"
)


type Game struct {
	InputChan chan Message
	Players []chan Message
}


type Message struct {
	Id string 
	X int32 
	Y int32
}

func (g *Game) Play() {
	for {
		m := <- g.InputChan
		log.Printf("Game loop %v", m)

		for i := 0; i < len(g.Players); i++ {
			g.Players[i] <- m
		}
	}
}