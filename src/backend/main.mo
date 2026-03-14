import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  //////////////////////
  // Data Definitions //
  //////////////////////

  module Types {
    public type UserProfile = {
      userId : Text; // Principal id
      username : Text;
      xp : Nat;
      level : Nat;
      battleWins : Nat;
      completedWorlds : [Text];
      achievements : [Text];
    };

    public type McqQuestion = {
      id : Text;
      moduleId : Nat;
      question : Text;
      optionA : Text;
      optionB : Text;
      optionC : Text;
      optionD : Text;
      correctOption : Text; // "A", "B", "C", "D"
      hint : Text;
      xpReward : Nat;
    };

    public type CodingProblem = {
      id : Text;
      moduleId : Nat;
      title : Text;
      description : Text;
      brokenCode : Text;
      solutionKeyword : Text;
      hint : Text;
      xpReward : Nat;
    };

    public type Achievement = {
      id : Text;
      name : Text;
      description : Text;
    };

    public type BattleRecord = {
      userId : Text;
      mode : Text;
      playerIds : [Text];
      scores : [(Text, Nat)];
      winnerId : Text;
      timestamp : Int;
    };

    public type AiHint = {
      id : Text;
      questionId : Text;
      hintText : Text;
    };

    public type Module = {
      id : Text;
      name : Text;
      icon : Text;
      theme : Text;
      description : Text;
    };

    public type LeaderboardEntry = {
      userId : Text;
      username : Text;
      xp : Nat;
    };
  };

  // Result type definition for compatibility
  public type Result<Ok, Err> = { #ok : Ok; #err : Err };

  // Core Data Structures
  let usersMap = Map.empty<Text, Types.UserProfile>();
  let userProfilesMap = Map.empty<Principal, Types.UserProfile>();
  let battleRecordsMap = Map.empty<Text, Types.BattleRecord>();
  let aiHintsMap = Map.empty<Text, Types.AiHint>();

  // Static Data (Modules, Questions, Problems)
  let modules : [Types.Module] = [
    {
      id = "python";
      name = "Python Forest";
      icon = "🌲";
      theme = "forest";
      description = "Master Python in a magical forest";
    },
    {
      id = "java";
      name = "Java Ocean";
      icon = "🌊";
      theme = "ocean";
      description = "Conquer Java across ocean islands";
    },
    {
      id = "c";
      name = "C City";
      icon = "🏙";
      theme = "city";
      description = "Navigate C programming in a cyber city";
    },
    {
      id = "ai";
      name = "AI Island";
      icon = "🏝";
      theme = "island";
      description = "Explore AI concepts on a futuristic island";
    },
  ];

  // MCQ Questions (sample)
  let mcqQuestions : [Types.McqQuestion] = [
    // Python
    {
      id = "p1";
      moduleId = 0;
      question = "What does len() return?";
      optionA = "Length of object";
      optionB = "Deletes variable";
      optionC = "Converts string";
      optionD = "Creates loop";
      correctOption = "A";
      hint = "len() returns the length of a sequence.";
      xpReward = 10;
    },
    // Java
    {
      id = "j1";
      moduleId = 1;
      question = "Which keyword creates an object in Java?";
      optionA = "create";
      optionB = "new";
      optionC = "object";
      optionD = "make";
      correctOption = "B";
      hint = "Objects are created with the keyword 'new'.";
      xpReward = 10;
    },
    // C
    {
      id = "c1";
      moduleId = 2;
      question = "What is a pointer in C?";
      optionA = "Variable storing address";
      optionB = "Array type";
      optionC = "Function";
      optionD = "Loop variable";
      correctOption = "A";
      hint = "Pointers store memory addresses of variables.";
      xpReward = 10;
    },
    // AI
    {
      id = "ai1";
      moduleId = 3;
      question = "What is machine learning?";
      optionA = "Programming robots";
      optionB = "Learning from data";
      optionC = "Database queries";
      optionD = "Web development";
      correctOption = "B";
      hint = "ML involves algorithms learning from datasets.";
      xpReward = 10;
    },
  ];

  // Coding Problems (sample)
  let codingProblems : [Types.CodingProblem] = [
    // Python
    {
      id = "py1";
      moduleId = 0;
      title = "Fix the print statement";
      description = "Debug the code for correct output";
      brokenCode = "print(\"Hello World\"";
      solutionKeyword = ")";
      hint = "Look for missing characters";
      xpReward = 15;
    },
    // Java
    {
      id = "java1";
      moduleId = 1;
      title = "Fix missing semicolon";
      description = "Debug the code for proper syntax";
      brokenCode = "System.out.println(\"Hello\")";
      solutionKeyword = ";";
      hint = "Java statements require semicolons";
      xpReward = 15;
    },
    // C
    {
      id = "c1";
      moduleId = 2;
      title = "Fix missing semicolon";
      description = "Add a semicolon to complete the statement";
      brokenCode = "printf(\"Hello World\")";
      solutionKeyword = ";";
      hint = "Missing semicolon at end of statement";
      xpReward = 15;
    },
    // AI
    {
      id = "ai1";
      moduleId = 3;
      title = "Fix array shape";
      description = "Correct the attribute to print the array shape";
      brokenCode = "print(x.shapes)";
      solutionKeyword = "x.shape";
      hint = "Correct attribute is 'shape', not 'shapes'";
      xpReward = 15;
    },
  ];

  // Achievements (simplified)
  let achievements : [Types.Achievement] = [
    {
      id = "first_win";
      name = "First Battle Win";
      description = "Win your first battle";
    },
    {
      id = "python_master";
      name = "Python Master";
      description = "Complete all Python challenges";
    },
  ];

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  ///////////////////////////
  ////// Comparators  //////
  ///////////////////////////

  module Leaderboard {
    public type Entry = Types.LeaderboardEntry;
    public func compare(entry1 : Entry, entry2 : Entry) : Order.Order {
      Nat.compare(entry2.xp, entry1.xp);
    };
  };

  // REQUIRED PROFILE FUNCTIONS

  public query ({ caller }) func getCallerUserProfile() : async ?Types.UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfilesMap.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Types.UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfilesMap.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Types.UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfilesMap.add(caller, profile);
  };

  // USER MANAGEMENT FUNCTIONS

  public shared ({ caller }) func registerUser(username : Text, _email : Text, _passwordHash : Text) : async Result<Text, Text> {
    // Registration is open to guests (no authorization check needed)
    if (usersMap.values().toArray().find(func(user) { user.username == username }) != null) {
      return #err("Username already taken");
    };

    let newUserProfile : Types.UserProfile = {
      userId = username;
      username;
      xp = 0;
      level = 1;
      battleWins = 0;
      completedWorlds = [];
      achievements = [];
    };
    usersMap.add(username, newUserProfile);
    #ok(username);
  };

  public query ({ caller }) func loginUser(_email : Text, _passwordHash : Text) : async Result<Types.UserProfile, Text> {
    Runtime.trap("Not implemented. Password authentication needs proposal for limitation.");
  };

  public query ({ caller }) func getProfile(userId : Text) : async Result<Types.UserProfile, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    switch (usersMap.get(userId)) {
      case (null) { #err("User not found") };
      case (?profile) {
        // Users can only view their own profile unless they are admin
        if (profile.userId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own profile");
        };
        #ok(profile);
      };
    };
  };

  public shared ({ caller }) func updateXP(userId : Text, xpToAdd : Nat) : async Result<Nat, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update XP");
    };

    switch (usersMap.get(userId)) {
      case (null) { #err("User not found") };
      case (?profile) {
        // Users can only update their own XP unless they are admin
        if (profile.userId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own XP");
        };

        let updatedProfile = {
          profile with
          xp = profile.xp + xpToAdd;
        };
        usersMap.add(userId, updatedProfile);
        #ok(updatedProfile.xp);
      };
    };
  };

  // MODULES / PROBLEM MGMT (Public access - no auth required)

  public query ({ caller }) func getModules() : async [Types.Module] {
    modules;
  };

  public query ({ caller }) func getMcqQuestions(moduleId : Text) : async [Types.McqQuestion] {
    mcqQuestions.filter(func(q) { q.moduleId.toText() == moduleId });
  };

  public query ({ caller }) func getCodingProblems(moduleId : Text) : async [Types.CodingProblem] {
    codingProblems.filter(func(p) { p.moduleId.toText() == moduleId });
  };

  // Game Functions

  public shared ({ caller }) func submitMcqAnswer(userId : Text, questionId : Text, selectedOption : Text) : async Result<{ correct : Bool; xpEarned : Nat; message : Text }, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit answers");
    };

    // Verify user is submitting for themselves
    switch (usersMap.get(userId)) {
      case (null) { return #err("User not found") };
      case (?profile) {
        if (profile.userId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only submit answers for yourself");
        };
      };
    };

    let questionOpt = mcqQuestions.find(func(q) { q.id == questionId });
    switch (questionOpt) {
      case (null) { #err("Question not found") };
      case (?question) {
        let isCorrect = Char.equal(selectedOption.toArray()[0], question.correctOption.toArray()[0]);
        let xpEarned = if (isCorrect) { question.xpReward } else { 0 };

        if (isCorrect) { ignore await updateXP(userId, question.xpReward) };

        #ok({
          correct = isCorrect;
          xpEarned;
          message = if (isCorrect) { "Correct!" } else { "Incorrect. Try again!" };
        });
      };
    };
  };

  public shared ({ caller }) func checkCode(userId : Text, problemId : Text, submittedCode : Text) : async Result<{ passed : Bool; message : Text; xpEarned : Nat }, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit code");
    };

    // Verify user is submitting for themselves
    switch (usersMap.get(userId)) {
      case (null) { return #err("User not found") };
      case (?profile) {
        if (profile.userId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only submit code for yourself");
        };
      };
    };

    let problemOpt = codingProblems.find(func(p) { p.id == problemId });
    switch (problemOpt) {
      case (null) { #err("Problem not found") };
      case (?problem) {
        let passed = submittedCode.contains(#text(problem.solutionKeyword));
        let xpEarned = if (passed) { problem.xpReward } else { 0 };

        if (passed) { ignore await updateXP(userId, problem.xpReward) };

        #ok({
          passed;
          message = if (passed) { "Code works!" } else { "Try again." };
          xpEarned;
        });
      };
    };
  };

  // LEADERBOARD (Public access - no auth required)
  public query ({ caller }) func getLeaderboard(_filterModule : ?Text) : async [Types.LeaderboardEntry] {
    usersMap.values().toArray().map(func(user) { { userId = user.userId; username = user.username; xp = user.xp } }).sort();
  };

  // AI HINTS (Public access - no auth required)
  public query ({ caller }) func getAiHint(questionId : Text) : async Result<Text, Text> {
    switch (aiHintsMap.get(questionId)) {
      case (null) { #err("No AI hint found") };
      case (?hint) { #ok(hint.hintText) };
    };
  };

  // BATTLE SYSTEM (stubs - require authentication)
  public shared ({ caller }) func createBattle(_userId : Text, _mode : Text) : async Result<Types.BattleRecord, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create battles");
    };
    Runtime.trap("Battle system not implemented yet");
  };

  public shared ({ caller }) func joinBattle(_userId : Text, _battleId : Text) : async Result<Types.BattleRecord, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can join battles");
    };
    Runtime.trap("Battle system not implemented yet");
  };

  public shared ({ caller }) func submitBattleAnswer(_userId : Text, _battleId : Text, _answer : Text, _timeTaken : Nat) : async Result<{ score : Nat; correct : Bool }, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit battle answers");
    };
    Runtime.trap("Battle system not implemented yet");
  };

  public shared ({ caller }) func completeBattle(_battleId : Text) : async Result<Types.BattleRecord, Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can complete battles");
    };
    Runtime.trap("Battle system not implemented yet");
  };
};
