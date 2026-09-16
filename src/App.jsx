import "./App.css";
import UniversalInput from "./UniversalInput";
import useLocalStorageState from "./hooks/useLocalStorageState";

const App = () => {
  const [firstValue, setFirstValue] = useLocalStorageState(
  "universal-input-number",
  ""
  );

  const [secondValue, setSecondValue] = useLocalStorageState(
    "universal-input-text",
    ""
  );

  const [thirdValue, setThirdValue] = useLocalStorageState(
    "universal-input-multiline",
    ""
  );

  const [fourValue, setFourValue] = useLocalStorageState(
    "universal-input-mask",
    ""
  );

  const [fiveValue, setFiveValue] = useLocalStorageState(
    "universal-input-select",
    ""
  );

  return (
    <div className="main">
      <h1 className="title">THIS IS NOT A TEST TASK</h1>
      <div className="inputItems">
        <UniversalInput
          type="number"
          disabled={false}
          value={firstValue}
          onChange={setFirstValue}
          placeholder="Number type"
          style={{ width: "100%" }}
          className="inputItem"
        />
        <UniversalInput
          disabled={false}
          value={secondValue}
          onChange={setSecondValue}
          placeholder="Text type"
          style={{ width: "100%" }}
          className="inputItem"
        />
        <UniversalInput
          multiline={true}
          disabled={false}
          value={thirdValue}
          onChange={setThirdValue}
          placeholder="Text multiline type"
          style={{ width: "100%" }}
          className="inputItem"
        />
        <UniversalInput
          disabled={false}
          value={fourValue}
          onChange={setFourValue}
          mask={"111-111"}
          placeholder="With mask"
          style={{
            width: "100%",
            backgroundColor: "white",
            color: "black",
            borderRadius: "15px",
          }}
          className="inputItem"
        />
        <UniversalInput
          disabled={false}
          value={fiveValue}
          onChange={setFiveValue}
          options={[
            { value: "first element", label: "first element" },
            { value: "second element", label: "second element" },
            { value: "third element", label: "third element" },
          ]}
          placeholder="Another type"
          style={{
            width: "100%",
            backgroundColor: "white",
            color: "black",
            borderRadius: "15px",
          }}
          className="inputItem"
        />
      </div>
    </div>
  );
};

export default App;
