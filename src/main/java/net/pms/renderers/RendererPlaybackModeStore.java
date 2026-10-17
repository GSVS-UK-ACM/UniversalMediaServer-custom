/*
 * This file is part of Universal Media Server, based on PS3 Media Server.
 *
 * This program is a free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; version 2 of the License only.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */
package net.pms.renderers;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Properties;
import net.pms.configuration.UmsConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Persists playback-mode selections separately from renderer profiles. */
public final class RendererPlaybackModeStore {
	private static final Logger LOGGER = LoggerFactory.getLogger(RendererPlaybackModeStore.class);
	private static final String FILENAME = "renderer-playback-modes.properties";

	private final Path path;
	private final Properties properties = new Properties();

	RendererPlaybackModeStore(Path path) {
		this.path = path;
		load();
	}

	public static RendererPlaybackModeStore getDefault() {
		return Holder.INSTANCE;
	}

	public synchronized RendererPlaybackMode get(String rendererId) {
		return rendererId == null ? RendererPlaybackMode.AUTOMATIC :
			RendererPlaybackMode.fromPersistedValue(properties.getProperty(rendererId));
	}

	public synchronized void set(String rendererId, RendererPlaybackMode mode) {
		if (rendererId == null || mode == null) {
			return;
		}

		if (mode == RendererPlaybackMode.AUTOMATIC) {
			properties.remove(rendererId);
		} else {
			properties.setProperty(rendererId, mode.getPersistedValue());
		}
		save();
	}

	private void load() {
		if (!Files.isRegularFile(path)) {
			return;
		}
		try (InputStream input = Files.newInputStream(path)) {
			properties.load(input);
		} catch (IOException e) {
			LOGGER.warn("Could not load renderer playback modes from {}: {}", path, e.getMessage());
		}
	}

	private void save() {
		Path parent = path.getParent();
		Path temporaryFile = null;
		try {
			Files.createDirectories(parent);
			temporaryFile = Files.createTempFile(parent, FILENAME, ".tmp");
			try (OutputStream output = Files.newOutputStream(temporaryFile)) {
				properties.store(output, "Per-device playback modes");
			}
			try {
				Files.move(temporaryFile, path, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
			} catch (AtomicMoveNotSupportedException e) {
				Files.move(temporaryFile, path, StandardCopyOption.REPLACE_EXISTING);
			}
		} catch (IOException e) {
			LOGGER.warn("Could not save renderer playback modes to {}: {}", path, e.getMessage());
			if (temporaryFile != null) {
				try {
					Files.deleteIfExists(temporaryFile);
				} catch (IOException cleanupError) {
					LOGGER.debug("Could not remove temporary playback-mode file {}", temporaryFile, cleanupError);
				}
			}
		}
	}

	private static class Holder {
		private static final RendererPlaybackModeStore INSTANCE = new RendererPlaybackModeStore(
			Path.of(UmsConfiguration.getProfileDirectory(), FILENAME)
		);
	}
}
