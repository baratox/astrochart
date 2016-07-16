describe("astrochart", function() {
  
  it("Get a version of astrochart", function () {
    expect(Astrochart.version).toBe("0.0.1");
  });
  
  it("say Hello World", function () {
    expect(Astrochart.hello()).toBe("Hello World JS!");
  });
  
});