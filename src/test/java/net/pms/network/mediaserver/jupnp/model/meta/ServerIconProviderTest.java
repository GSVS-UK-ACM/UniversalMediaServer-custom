package net.pms.network.mediaserver.jupnp.model.meta;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import java.awt.image.BufferedImage;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class ServerIconProviderTest {

	@Test
	void validPrivatePngIsServedUnchanged(@TempDir Path directory) throws Exception {
		Path file = directory.resolve("icon-square-48.png");
		ImageIO.write(new BufferedImage(48, 48, BufferedImage.TYPE_INT_RGB), "png", file.toFile());
		assertArrayEquals(Files.readAllBytes(file), ServerIconProvider.load(directory, file.getFileName().toString(), "image/png", 48).getData());
	}

	@Test
	void validPrivateJpegIsServedUnchanged(@TempDir Path directory) throws Exception {
		Path file = directory.resolve("icon-square-48.jpg");
		ImageIO.write(new BufferedImage(48, 48, BufferedImage.TYPE_INT_RGB), "jpeg", file.toFile());
		assertArrayEquals(Files.readAllBytes(file), ServerIconProvider.load(directory, file.getFileName().toString(), "image/jpeg", 48).getData());
	}

	@Test
	void missingPrivateDirectoryKeepsBundledIcons(@TempDir Path directory) throws Exception {
		assertNotNull(ServerIconProvider.load(directory.resolve("missing"), "icon-square-48.png", "image/png", 48));
	}

	@Test
	void corruptAndWrongSizeFilesFallBackPerIcon(@TempDir Path directory) throws Exception {
		Path file = directory.resolve("icon-square-48.png");
		byte[] expected;
		try (InputStream resource = getClass().getResourceAsStream("/resources/images/icon-square-48.png")) {
			expected = resource.readAllBytes();
		}
		Files.writeString(file, "not an image");
		assertArrayEquals(expected, ServerIconProvider.load(directory, file.getFileName().toString(), "image/png", 48).getData());
		ImageIO.write(new BufferedImage(24, 24, BufferedImage.TYPE_INT_RGB), "png", file.toFile());
		assertArrayEquals(expected, ServerIconProvider.load(directory, file.getFileName().toString(), "image/png", 48).getData());
	}

	@Test
	void wrongMimeTypeAndOversizedFilesFallBack(@TempDir Path directory) throws Exception {
		Path file = directory.resolve("icon-square-48.jpg");
		byte[] expected;
		try (InputStream resource = getClass().getResourceAsStream("/resources/images/icon-square-48.jpg")) {
			expected = resource.readAllBytes();
		}
		ImageIO.write(new BufferedImage(48, 48, BufferedImage.TYPE_INT_RGB), "png", file.toFile());
		assertArrayEquals(expected, ServerIconProvider.load(directory, file.getFileName().toString(), "image/jpeg", 48).getData());
		Files.write(file, new byte[1024 * 1024 + 1]);
		assertArrayEquals(expected, ServerIconProvider.load(directory, file.getFileName().toString(), "image/jpeg", 48).getData());
	}
}
