import Character from "./character";
import PlotPoint from "./plotPoint";

export default class Story {
  title: string;
  overview: string | undefined;
  plotPoints: PlotPoint[];
  characters: Character[];

  constructor(title: string, overview: string | undefined, plotPoints: PlotPoint[], characters: Character[]) {
    this.title = title;
    this.overview = overview;
    this.plotPoints = plotPoints;
    this.characters = characters;
  }
}