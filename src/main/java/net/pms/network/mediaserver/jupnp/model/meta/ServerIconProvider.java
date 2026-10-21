package net.pms.network.mediaserver.jupnp.model.meta;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.imageio.ImageIO;
import org.jupnp.model.meta.Icon;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Loads private server branding without modifying or redistributing the application jar. */
final class ServerIconProvider {

	private static final Logger LOGGER = LoggerFactory.getLogger(ServerIconProvider.class);
	private static final long MAX_ICON_BYTES = 1024 * 1024;

	private ServerIconProvider() {
	}

	/**
	 * Uses a correctly sized PNG/JPEG override, otherwise keeps the bundled icon.
	 * Each size falls back independently, so a damaged optional file cannot remove
	 * every discovery icon or prevent the media server from starting.
	 */
	static Icon load(Path directory, String filename, String mimeType, int size) throws IOException {
		Path override = directory.resolve(filename);
		if (Files.isRegularFile(override)) {
			try {
				if (Files.size(override) > MAX_ICON_BYTES) {
					throw new IOException("Icon exceeds the 1 MiB size limit");
				}
				byte[] bytes = Files.readAllBytes(override);
				boolean matchingFormat = "image/png".equals(mimeType)
					? bytes.length > 8 && bytes[0] == (byte) 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G'
					: bytes.length > 3 && bytes[0] == (byte) 0xff && bytes[1] == (byte) 0xd8;
				BufferedImage image = ImageIO.read(new java.io.ByteArrayInputStream(bytes));
				if (!matchingFormat || image == null || image.getWidth() != size || image.getHeight() != size) {
					throw new IOException("Icon format or dimensions do not match " + mimeType + " " + size + "x" + size);
				}
				LOGGER.debug("Using custom discovery icon {}", override);
				return new Icon(mimeType, size, size, 24, "images/" + filename, bytes);
			} catch (IOException | RuntimeException e) {
				LOGGER.warn("Cannot use custom discovery icon {}: {}. Using bundled artwork.", override, e.getMessage());
			}
		}
		try (InputStream bundled = ServerIconProvider.class.getResourceAsStream("/resources/images/" + filename)) {
			if (bundled == null) {
				throw new IOException("Bundled discovery icon is missing: " + filename);
			}
			return new Icon(mimeType, size, size, 24, "images/" + filename, bundled);
		}
	}
}
