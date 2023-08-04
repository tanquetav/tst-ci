export const BuildSpecContent2 = {
  version: "0.2",
  env: {
    variables: {
      GIT_LFS_SKIP_SMUDGE: "1",
    },
  },
  phases: {
    pre_build: {
      commands: [],
    },
    install: {
      commands: [],
    },
    build: {
      commands: [" cat binary/file.dwg", " ls .git", " ls .git/lfs || true"],
    },
    post_build: {
      commands: [],
    },
  },
  cache: {
    paths: [".git/lfs/objects/**/*"],
  },
  artifacts: {
    files: [],
  },
};
export const BuildSpecContent = {
  version: "0.2",
  env: {
    variables: {
      GIT_LFS_SKIP_SMUDGE: "1",
    },
  },
  phases: {
    pre_build: {
      commands: [],
    },
    install: {
      commands: [],
    },
    build: {
      commands: [
        " get-content binary\\file.dwg",
        " get-childitem .git",
        " get-childitem .git\\lfs",
      ],
    },
    post_build: {
      commands: [],
    },
  },
  cache: {
    paths: [".git/lfs/objects/**/*"],
  },
  artifacts: {
    files: [],
  },
};

export function createBuildSpec(): any {
  let commands = [...BuildSpecContent.phases.build.commands];
  const render = {
    ...BuildSpecContent,
    phases: {
      ...BuildSpecContent.phases,
      build: {
        ...BuildSpecContent.phases.build,
        commands: commands,
      },
    },
  };
  return render;
}

export function createBuildSpec2(): any {
  let commands = [...BuildSpecContent2.phases.build.commands];
  const render = {
    ...BuildSpecContent2,
    phases: {
      ...BuildSpecContent2.phases,
      build: {
        ...BuildSpecContent2.phases.build,
        commands: commands,
      },
    },
  };
  return render;
}
