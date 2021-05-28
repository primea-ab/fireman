package game 

import (
	"log"
	"time"
)

var (
	tileSize = 40
	maxX = 17
	maxY = 13
	pr = 16
	startingPower = 6
	startingBombs = 3
	explosionTime = time.Millisecond * 500
)

type Game struct {
	InputChan chan Message
	Players map[string]*Player

	BombChan chan *Bomb
	Bombs map[int64]*Bomb
}

type Bomb struct {
	Id int64
	X int
	Y int
	Owner string
	Power int
}

type Message struct {
	Act string `json:"Act,omitempty"`
	Id string `json:"Id,omitempty"`
	X int `json:"X,omitempty"`
	Y int`json:"Y,omitempty"`
	Color string `json:"Color,omitempty"`
	E []Tile `json:"E,omitempty"`
	BombId int64 `json:"BombId,omitempty"`
}

type Player struct {
	X int
	Y int
	InGame bool
	Id string
	Color string
	MaxBombs int
	BombPower int
	OutChan chan Message
	Alive bool
}

type Tile struct {
	X int
	Y int
}


func NewGame() *Game {
	g := &Game{}
	g.InputChan = make(chan Message)
	g.Players = map[string]*Player{}
	g.Bombs = map[int64]*Bomb{}
	g.BombChan = make(chan *Bomb)
	return g
}

func (g *Game) Play() {
	for {
		select {
			case m := <- g.InputChan:
				// log.Printf("Game loop %v", m)
				if m.Act == "move" {
					g.Players[m.Id].X = m.X
					g.Players[m.Id].Y = m.Y
					g.broadcast(Message{Act: "move",Id: m.Id, X: m.X, Y: m.Y})
				} else if m.Act == "bomb" {
					if !g.Players[m.Id].Alive {
						continue
					}
					activeBombs := 0
					for _, v := range g.Bombs {
						if v.Owner == m.Id {
							activeBombs = activeBombs + 1
						}
					}
					if activeBombs < g.Players[m.Id].MaxBombs {
						newBomb := &Bomb{
							Id: time.Now().UnixNano(),
							Owner: m.Id,
							X: g.Players[m.Id].X/tileSize,
							Y: g.Players[m.Id].Y/tileSize,
							Power: g.Players[m.Id].BombPower,
						}
						log.Printf("%#v", newBomb)
						g.Bombs[newBomb.Id] = newBomb
						go func() {
							time.Sleep(time.Second * 2)
							g.BombChan <- newBomb
						}()
						g.broadcast(Message{Act: "bomb", X: newBomb.X, Y: newBomb.Y})
					}

				}
			case b := <- g.BombChan:
				x := b.X
				y := b.Y
				log.Printf("Detonation tile x:%v, y:%v", x, y)
			
				// If x is even there will be a horizontal detonation
				// If y is even there will be a vertical detontaion
				// IF Both are odd there will be a Cross detonatoin 
				// Add tile that bomb is on to exploded tiles
				explodedTiles := []Tile{Tile{X: x, Y: y}}
				if x % 2 == 1 {
					// Explod up/down
					for i := max(1, y - b.Power); i <= min(maxY, y + b.Power); i++ {
						if i != y {
							explodedTiles = append(explodedTiles, Tile{X: x, Y: i})
						}
					}
				}
				if y % 2 == 1 {
					// Explode left/right
					for i := max(1, x - b.Power); i <= min(maxX, x + b.Power); i++ {
						if i != x {
							explodedTiles = append(explodedTiles, Tile{X: i, Y: y})
						}
					}
				}
				log.Printf("Detonation %#v", explodedTiles)
				delete(g.Bombs, b.Id)

				g.broadcast(Message{Act: "ex", E: explodedTiles, BombId: b.Id})
				go func(){
					time.Sleep(explosionTime)
					g.broadcast(Message{Act: "rex", BombId: b.Id})
				}()

				for id, p := range g.Players {
					if onAnyTile(p.X, p.Y, explodedTiles) {
						p.Alive = false
						p.Color = "white"
						g.broadcast(Message{Act: "kill", Id: id})
					}
				}

		}
		
	}
}

func (g *Game) AddPlayer(player *Player) {

	player.MaxBombs = startingBombs
	player.BombPower = startingPower
	player.Alive = true

	if len(g.Players) == 0 {
		player.X = tileSize + 20
		player.Y = tileSize + 20
		player.Color = "red"
	} else if len(g.Players) == 1 {
		player.X = tileSize*17 + 20
		player.Y = tileSize*13 + 20
		player.Color = "blue"
	} else if len(g.Players) == 2 {
		player.X = tileSize*17 + 20
		player.Y = tileSize + 20
		player.Color = "orange"
	} else if len(g.Players) == 3 {
		player.X = tileSize + 20
		player.Y = tileSize*13 + 20
		player.Color = "purple"
	} else if len(g.Players) == 4 {
		player.X = tileSize*9 + 20
		player.Y = tileSize + 20
		player.Color = "green"
	} else if len(g.Players) == 5 {
		player.X = tileSize*9 + 20
		player.Y = tileSize*13 + 20
		player.Color = "yellow"
	} else if len(g.Players) == 6 {
		player.X = tileSize + 20
		player.Y = tileSize*7 + 20
		player.Color = "pink"
	} else if len(g.Players) == 7 {
		player.X = tileSize*17 + 20
		player.Y = tileSize*7 + 20
		player.Color = "black"
	} else if len(g.Players) == 8 {
		player.X = tileSize*9 + 20
		player.Y = tileSize*7 + 20
		player.Color = "brown"
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

func min(x, y int) int {
	if x > y {
		return y
	}
	return x
}

func max(x, y int) int {
	if x > y {
		return x
	}
	return y
}

func onAnyTile(xCoord, yCoord int, tiles []Tile) bool {
	topPos := Tile{Y: (yCoord-pr)/tileSize, X: xCoord/tileSize}
	leftPos := Tile{Y: yCoord/tileSize, X: (xCoord - pr)/tileSize}
	rightPos := Tile{Y: yCoord/tileSize, X: (xCoord + pr)/tileSize}
	bottomPos := Tile{Y: (yCoord+pr)/tileSize, X: xCoord/tileSize}
	for _, v := range tiles {
		if (topPos.Y == v.Y && topPos.X == v.X) ||
		   (leftPos.Y == v.Y && topPos.X == v.X) ||
		   (rightPos.Y == v.Y && rightPos.X == v.X) ||
		   (bottomPos.Y == v.Y && bottomPos.X == v.X) {
		   	return true
		   }

	}
	return false
}