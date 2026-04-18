const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin to fix "folly/coro/Coroutine.h file not found" error.
 * This is caused by react-native-reanimated's native code trying to use
 * Folly coroutines which aren't available in newer RN 0.81+ Folly builds.
 * 
 * Injects -DFOLLY_CFG_NO_COROUTINES=1 into ALL pod targets' C++ flags.
 */
function withFollyFix(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      let podfileContents = fs.readFileSync(podfilePath, "utf8");

      // Skip if already patched
      if (podfileContents.includes("FOLLY_CFG_NO_COROUTINES")) {
        return config;
      }

      const follyFixSnippet = `
    # === Fix: folly/coro/Coroutine.h not found ===
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        existing_flags = config.build_settings['OTHER_CPLUSPLUSFLAGS'] || '$(inherited)'
        unless existing_flags.include?('-DFOLLY_CFG_NO_COROUTINES')
          config.build_settings['OTHER_CPLUSPLUSFLAGS'] = existing_flags + ' -DFOLLY_CFG_NO_COROUTINES=1'
        end
      end
    end
    # === End Fix ===`;

      // Insert into existing post_install block
      if (podfileContents.includes("post_install do |installer|")) {
        podfileContents = podfileContents.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|${follyFixSnippet}`
        );
      } else {
        // Create a new post_install block at the end
        podfileContents += `\npost_install do |installer|${follyFixSnippet}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfileContents);
      return config;
    },
  ]);
}

module.exports = withFollyFix;
