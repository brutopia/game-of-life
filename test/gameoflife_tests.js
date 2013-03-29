var width = 10, height=10;
var gol = new GameOfLife(width,height);

module("Toroidal Array")
test("Referencing",function(){
	var array = new ToroidalArray(['a','b','c','d','e']);
	strictEqual(array.get(0),  'a');
	strictEqual(array.get(4),  'e');
	strictEqual(array.get(5),  'a');
	strictEqual(array.get(15), 'a');
	strictEqual(array.get(-1), 'e');
	strictEqual(array.get(-5), 'a');
	strictEqual(array.get(-16),'e');
	ok(Array.prototype.get == undefined, "No extensions of the Array class");

});

module("Cells")
test("Rules", function(){
	var c = new Cell();
	ok(c.alive === true  && c.generation === 0, "Default state of a new cell should be alive and generation be 0");
	c.age();
	strictEqual(c.generation, 1, "Aged cell");
	c.kill();
	ok(c.alive === false && c.generation === 0, "Killed cell");
	c.spawn();
	ok(c.alive === true && c.generation === 0, "Spawned cell");
});


// Some tests for a first time javascripter to make sure private methods and properties are defined correctly
module("Encapsulation")
test("The GameOfLife class encapsulation", function() {
	strictEqual(gol.applyRules, undefined, 'Private methods should not be accessible');
	strictEqual(gol.randomBoard, undefined, 'Private methods should not be accessible');
	ok(gol.board instanceof Object, 'Private members with setters should be accessible');
	var cell = new Cell();
	throws(cell.alive = true, "Private members on Cell should not be accessible");
	throws(cell.lastState = true, "Private members on Cell should not be accessible");
	throws(cell.generation = 2, "Private members on Cell should not be accessible");
});

test("The GameOfLife assertions", function() {
	throws(function(){new GameOfLife()}, "Instantiating an object without giving a board size shouldn't be allowed");
	throws(function(){gol.board = ''}, "Trying to load a board with no argument");
	throws(function(){new Ruleset().parse()}, "Trying to parse rules with no argument");
});


module("Initialization")
test("Random board setup", function() {
	strictEqual(gol.board.length, width, "Correct width");
	strictEqual(gol.board[0].length, height, "Correct height");

	// Todo: Doesn't work
	function is(type, obj){
		var clas = Object.prototype.toString.call(obj).slice(8, -1);
    	return obj !== undefined && obj !== null && clas === type;
	}

	function countLiveCells(x){
		var cellcount = 0;
		gol.board.map(function(c){
			if(is('Cell',c)){
				cellcount++;
			}
		});
		return cellcount;
	}
	strictEqual(countLiveCells(gol), width*height, "All elements on the board should be filled by a cell");

	gol.randomize();
	strictEqual(gol.board.length * gol.board[0].length, width*height, "All elements on the board should be filled");
	strictEqual(countLiveCells(gol), width*height, "All elements on the board should be filled by a cell after randomizing");

});

test("Basic Conway rules", function(){
	strictEqual(gol.rules.s.length,2, "Two ways of surviving");
	strictEqual(gol.rules.b.length,1, "One way of spawning");
	ok(gol.rules.c < 1, "Infinite lifetime");
});


module("Logic")
test("Rule Parsing", function(){
	var localGol = new GameOfLife(1,1);
	var ruleSets = ['S1/B2','s1/b2', 's1/B2', 'b2/s1','s1/b2/c1', 'c1/b2/s1'];
	for(var i=0;i<ruleSets.length;i++){
		localGol.rules.parse(ruleSets[i]);
		ok( (localGol.rules.s[0] === 1) && 
			(localGol.rules.s.length ===1) &&
			(localGol.rules.b[0] === 2) && 
			(localGol.rules.b.length ===1), "Ruleset " + ruleSets[i] + " gives correct results");

	}
	localGol.rules.parse('s1/b1');
	ok(localGol.rules.c < 0, "C not given so it should be negative");

	throws(function(){localGol.rules.parse('s1')}, "Both S and B are required");
	throws(function(){localGol.rules.parse('b1')}, "Both S and B are required");
	throws(function(){localGol.rules.parse('s1c1')}, "Both S and B are required");

});

test("Applying Rules", function(){
	var localGol = new GameOfLife(10,10);
	function compareEvolution(before, expected){
		localGol.board = before;
		localGol.evolve();
		for(var x=0;x<before.length;x++){
			for(var y=0;y<before[0].length;y++){
				if(expected[x][y] != localGol.board[x][y].alive){
					console.log("Differing boards");
					console.log(localGol.prettyPrint());
					return false;
				}
			}
		}
		return true;
	}


	ok(compareEvolution([	[0,0,0], 
							[1,1,0], 
							[1,1,0]],

						[	[0,0,0], 
							[1,1,0], 
							[1,1,0]]

						), "Block");


	ok(compareEvolution([	[0,0,0,0], 
							[0,1,1,1], 
							[0,0,0,0],
							[0,0,0,0]],

						[	[0,0,1,0], 
							[0,0,1,0], 
							[0,0,1,0],
							[0,0,0,0]]

						), "Blinker");


	ok(compareEvolution([	[0,0,1,0,0], 
							[1,0,1,0,0], 
							[0,1,1,0,0],
							[0,0,0,0,0],
							[0,0,0,0,0]],

						[	[0,1,0,0,0], 
							[0,0,1,1,0], 
							[0,1,1,0,0],
							[0,0,0,0,0],
							[0,0,0,0,0]]

						), "Glider");

	ok(!compareEvolution([	[0,0,1,0,0], 
							[1,0,1,0,0], 
							[0,1,1,0,0],
							[0,0,0,0,0],
							[0,0,0,0,0]],

						[	[0,1,0,0,0], 
							[0,1,1,1,0], 
							[0,1,1,0,0],
							[0,0,0,0,0],
							[0,0,0,0,0]]

						), "Error");

});