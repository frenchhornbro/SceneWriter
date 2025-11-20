export default class Character {
  name: string;
  age: string | undefined;
  height: string | undefined;
  description: string | undefined;
  backstory: string | undefined;

  constructor(name: string, age: string | undefined, height: string | undefined, description: string | undefined, backstory: string | undefined) {
    this.name = name;
    this.age = age;
    this.height = height;
    this.description = description;
    this.backstory = backstory;
  }
}