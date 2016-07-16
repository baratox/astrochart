describe("astrochart", function() {
  
  it("Get a version of astrochart", function () {
    expect(astrochart.version).toBe("0.0.1");
  });
  
  it("say Hello World", function () {
    expect(astrochart.hello()).toBe("Hello World JS!");
  });
  
});