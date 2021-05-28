package game 

import (
	"log"
)

var tileSize = 40

type Game struct {
	InputChan chan Message
	Players []Player
}


type Message struct {
	A string
	Id string 
	X float32 
	Y float32
	Color string
}

type Player struct {
	X float32
	Y float32
	InGame bool
	Id string
	Color string
	OutChan chan Message
}


func NewGame() *Game {
	g := &Game{}
	g.InputChan = make(chan Message)
	return g
}

func (g *Game) Play() {
	for {
		m := <- g.InputChan
		log.Printf("Game loop %v", m)
		g.broadcast(m)
	}
}

func (g *Game) AddPlayer(player *Player) {

	if len(g.Players) == 0 {
		player.X = float32(tileSize)
		player.Y = float32(tileSize)
		player.Color = "red"
	} else if len(g.Players) == 1 {
		player.X = float32(tileSize*17)
		player.Y = float32(tileSize*13)
		player.Color = "blue"
	} else if len(g.Players) == 2 {
		player.X = float32(tileSize*17)
		player.Y = float32(tileSize)
		player.Color = "orange"
	} else if len(g.Players) == 3 {
		player.X = float32(tileSize)
		player.Y = float32(tileSize*13)
		player.Color = "purple"
	} else {
		return
	}

	g.Players = append(g.Players, *player)
	player.InGame = true


	for i := 0; i < len(g.Players); i++ {
		p := g.Players[i]
		posMsg := Message{Id: p.Id, X: p.X, Y: p.Y, Color: p.Color}
		g.broadcast(posMsg)
	}
}

func (g *Game)broadcast(msg Message) {
	for i := 0; i < len(g.Players); i++ {
		g.Players[i].OutChan <- msg
	}
}