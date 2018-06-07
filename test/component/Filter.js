define(["Tone/component/Filter", "helper/Basic", "helper/Offline", "helper/Test", 
	"Tone/signal/Signal", "helper/PassAudio", "helper/PassAudioStereo", "Tone/source/Oscillator"], 
function(Filter, Basic, Offline, Test, Signal, PassAudio, PassAudioStereo, Oscillator){
	describe("Filter", function(){

		Basic(Filter);

		context("Filtering", function(){

			it("handles input and output connections", function(){
				var filter = new Filter();
				Test.connect(filter);
				filter.connect(Test);
				filter.dispose();
			});

			it("can be constructed with a arguments", function(){
				var filter = new Filter(200, "highpass");
				expect(filter.frequency.value).to.be.closeTo(200, 0.001);
				expect(filter.type).to.equal("highpass");
				filter.dispose();
			});

			it("can be constructed with an object", function(){
				var filter = new Filter({
					"frequency" : 340,
					"type" : "bandpass"
				});
				expect(filter.frequency.value).to.be.closeTo(340, 0.001);
				expect(filter.type).to.equal("bandpass");
				filter.dispose();
			});

			it("can set/get values as an Object", function(){
				var filter = new Filter();
				var values = {
					"type" : "highpass",
					"frequency" : 440,
					"rolloff" : -24,
					"Q" : 2,
					"gain" : -6,
				};
				filter.set(values);
				expect(filter.get()).to.have.keys(["type", "frequency", "rolloff", "Q", "gain"]);
				expect(filter.type).to.equal(values.type);
				expect(filter.frequency.value).to.equal(values.frequency);
				expect(filter.rolloff).to.equal(values.rolloff);
				expect(filter.Q.value).to.equal(values.Q);
				expect(filter.gain.value).to.be.closeTo(values.gain, 0.04);
				filter.dispose();
			});

			it("passes the incoming signal through", function(){
				return PassAudio(function(input){
					var filter = new Filter().toMaster();
					input.connect(filter);
				});
			});

			it("passes the incoming stereo signal through", function(){
				return PassAudioStereo(function(input){
					var filter = new Filter().toMaster();
					input.connect(filter);
				});
			});

			it("only accepts filter values -12, -24, -48 and -96", function(){
				var filter = new Filter();
				filter.rolloff = -12;
				expect(filter.rolloff).to.equal(-12);
				filter.rolloff = "-24";
				expect(filter.rolloff).to.equal(-24);
				filter.rolloff = -48;
				expect(filter.rolloff).to.equal(-48);
				filter.rolloff = -96;
				expect(filter.rolloff).to.equal(-96);
				expect(function(){
					filter.rolloff = -95;
				}).to.throw(Error);
				filter.dispose();
			});

			it("can set the basic filter types", function(){
				var filter = new Filter();
				var types = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
				for (var i = 0; i < types.length; i++){
					filter.type = types[i];
					expect(filter.type).to.equal(types[i]);
				}
				expect(function(){
					filter.type = "nontype";
				}).to.throw(Error);
				filter.dispose();
			});

			it("attenuates the incoming signal", function(){
				return Offline(function(){
					var filter = new Filter(700, "lowpass").toMaster();
					filter.Q.value = 0;
					var osc = new Oscillator(880).connect(filter);
					osc.start(0);
				}, 0.2).then(function(buffer){
					expect(buffer.getRmsAtTime(0.05)).to.be.closeTo(0.51, 0.01);
					expect(buffer.getRmsAtTime(0.1)).to.be.closeTo(0.51, 0.01);
				});
			});
			
		});
	});
});
