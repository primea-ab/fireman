package game 

import (
	// "log"
	"time"
)

var tileSize = 40

type Game struct {
	InputChan chan Message
	Players map[string]*Player

	BombChan chan Bomb
	Bombs map[int64]*Bomb
}

type Bomb struct {
	Id int64
	X float32
	Y float32
	Owner string
}

type Message struct {
	Act string
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
	MaxBombs int
	OutChan chan Message
}


func NewGame() *Game {
	g := &Game{}
	g.InputChan = make(chan Message)
	g.Players = map[string]*Player{}
	g.Bombs = map[int64]*Bomb{}
	return g
}

func (g *Game) Play() {
	for {
		m := <- g.InputChan
		// log.Printf("Game loop %v", m)
		if m.Act == "move" {
			g.Players[m.Id].X = m.X
			g.Players[m.Id].Y = m.Y
			g.broadcast(Message{Act: "move",Id: m.Id, X: m.X, Y: m.Y})
		} else if m.Act == "bomb" {
			activeBombs := 0
			for _, v := range g.Bombs {
				if v.Owner == m.Id {
					activeBombs = activeBombs + 1
				}
			}
			if activeBombs < g.Players[m.Id].MaxBombs {
				newBomb := &Bomb{Id: time.Now().UnixNano(), Owner: m.Id, X: g.Players[m.Id].X, Y: g.Players[m.Id].Y}
				g.Bombs[newBomb.Id] = newBomb
				g.broadcast(Message{Act: "bomb", X: newBomb.X, Y: newBomb.Y})
			}
		}
	}
}

func (g *Game) AddPlayer(player *Player) {

	player.MaxBombs = 1

	if len(g.Players) == 0 {
		player.X = float32(tileSize + 20)
		player.Y = float32(tileSize + 20)
		player.Color = "red"
	} else if len(g.Players) == 1 {
		player.X = float32(tileSize*17 + 20)
		player.Y = float32(tileSize*13 + 20)
		player.Color = "blue"
	} else if len(g.Players) == 2 {
		player.X = float32(tileSize*17 + 20)
		player.Y = float32(tileSize + 20)
		player.Color = "orange"
	} else if len(g.Players) == 3 {
		player.X = float32(tileSize + 20)
		player.Y = float32(tileSize*13 + 20)
		player.Color = "purple"
	} else {
		return
	}

	g.Players[player.Id] = player
	player.InGame = true


	for _, p := range g.Players {
		posMsg := Message{Id: p.Id, X: p.X, Y: p.Y, Color: p.Color}
		g.broadcast(posMsg)
	}
}

func (g *Game)broadcast(msg Message) {
	for _, p := range g.Players {
		p.OutChan <- msg
	}
}