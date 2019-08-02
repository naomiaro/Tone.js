import { expect } from "chai";
import { BasicTests } from "test/helper/Basic";
import { Offline } from "test/helper/Offline";
import { Oscillator } from "Tone/source/oscillator/Oscillator";
import { Reverb } from "./Reverb";

describe("Reverb", () => {

	BasicTests(Reverb);

	context("API", () => {

		it("can pass in options in the constructor", () => {
			const reverb = new Reverb({
				decay : 2,
				preDelay : 0.1,
			});
			expect(reverb.decay).to.be.closeTo(2, 0.001);
			expect(reverb.preDelay).to.be.closeTo(0.1, 0.001);
			reverb.dispose();
		});

		it("can get/set the options", () => {
			const reverb = new Reverb();
			reverb.set({
				decay : 0.4,
			});
			expect(reverb.get().decay).to.be.closeTo(0.4, 0.001);
			reverb.dispose();
		});

		it("can generate an IR", () => {
			const reverb = new Reverb();
			const promise = reverb.generate();
			expect(promise).to.have.property("then");
			return promise.then(() => {
				reverb.dispose();
			});
		});

		it("is silent before the reverb is generated", () => {
			return Offline(() => {
				const osc = new Oscillator();
				osc.start(0).stop(0.1);
				const reverb = new Reverb(0.2).toDestination();
				osc.connect(reverb);
			}).then((buffer) => {
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("passes audio from input to output", () => {
			return Offline(async () => {
				const osc = new Oscillator();
				osc.start(0).stop(0.1);
				const reverb = new Reverb(0.2).toDestination();
				osc.connect(reverb);
				await reverb.generate();
			}, 0.3).then((buffer) => {
				expect(buffer.getRmsAtTime(0.05)).to.be.greaterThan(0);
				expect(buffer.getRmsAtTime(0.1)).to.be.greaterThan(0);
				expect(buffer.getRmsAtTime(0.2)).to.be.greaterThan(0);
			});
		});
	});
});
