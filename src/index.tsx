import { ActionPanel, Detail, List, Action, getPreferenceValues } from "@raycast/api";
import got from "got";
import { useState } from "react";

interface State {
  crates: CrateDesc[];
  symbol?: string;
  curr_select?: string;
}

interface CrateDesc {
  name: string;
  version: string;
  desc: string;
}

export default function Command() {

  const [state, setState] = useState<State>({ crates: [] })

  async function execQuery(query: string) {
    const splited = query.split('#');
    const crate = splited[0];

    console.log("splited: ", splited);

    if (splited.length > 1) {
      const symbol = splited[1];
      console.log("state before assign", state.symbol);
      state.symbol = symbol;
      console.log("state after assign", state.symbol);
      setState(state);
      // setState({ crates: state.crates, symbol: symbol, curr_select: state.curr_select })
    }

    await searchCrate(crate);
  }

  async function searchCrate(crate: string) {
    const data = await got.get(`https://crates.io/api/v1/crates?page=1&per_page=10&q=${crate}`, {
      parseJson: text => JSON.parse(text)
    }).json();

    const crates: Array<CrateDesc> = data["crates"].map(crate => {
      return {
        name: crate["name"],
        version: crate["newest_version"],
        desc: crate["description"],
      }
    });

    state.crates = crates;
    console.log("data: ", crates.length);
    setState({ crates: crates, symbol: state.symbol, curr_select: state.curr_select })
    // setState(state);
  }

  function changeSelect(select: string | null) {
    if (select !== null) {
      state.curr_select = select;
      console.log("select: ", select);
      setState({ crates: state.crates, symbol: state.symbol, curr_select: select })
    }
  }

  function getUrl() {
    let crateName = state.curr_select;

    console.log("symbol: ", state.symbol);

    if (state.symbol != undefined && state.symbol.length > 0) {
      return `https://docs.rs/${crateName}/latest/${crateName}/?search=${state.symbol}`
    } else {
      return `https://docs.rs/${crateName}`
    }
  }

  return (
    <List onSearchTextChange={execQuery} onSelectionChange={changeSelect}>
      {state.crates.map((crate) => (
        <List.Item title={crate.name} id={crate.name} subtitle={crate.desc} accessories={[
          { text: crate.version }
        ]} actions={<ActionPanel>
          <Action.OpenInBrowser url={getUrl()} />
        </ActionPanel>} />
      ))}
    </List>
  );
}
